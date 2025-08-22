import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { CustomPrismaAdapter } from "../custom-adapter";
import prisma from "../../../../server/prisma";

const handler = NextAuth({
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // SOLUTION: Use NextAuth default implementation
      // Custom sendVerificationRequest was causing timeouts in production
    })
  ],
  session: { strategy: "database" },
  pages: {
    signIn: '/auth',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { org: true }
        });
        
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.orgId = dbUser.orgId;
          session.user.orgName = dbUser.org.name;
        }
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };