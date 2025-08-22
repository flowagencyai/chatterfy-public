import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "./custom-adapter";
import EmailProvider from "next-auth/providers/email";
import prisma from "../../../server/prisma";

export const authConfig = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  ],
  session: { strategy: "database" as const },
  callbacks: {
    async signIn({ user }: any) {
      // O CustomPrismaAdapter já cuida da criação da org
      // Aqui só precisamos verificar/criar o plano FREE e subscription
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { 
            org: {
              include: {
                subscriptions: true
              }
            }
          }
        });

        if (dbUser && !dbUser.org.subscriptions.length) {
          // Usuário existe mas não tem subscription - criar
          let freePlan = await prisma.plan.findUnique({
            where: { code: "FREE" }
          });
          
          if (!freePlan) {
            // Se não existir, criar plano FREE básico
            freePlan = await prisma.plan.create({
              data: {
                code: "FREE",
                name: "Free Plan",
                monthlyCreditsTokens: 10000,
                dailyTokenLimit: 10000,
                storageLimitMB: 10,
                maxFileSizeMB: 5,
                features: JSON.stringify({})
              }
            });
          }

          await prisma.subscription.create({
            data: {
              orgId: dbUser.orgId,
              planId: freePlan.id,
              active: true,
              periodStart: new Date(),
              periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
            }
          });
        }
      }
      return true;
    },
    async session({ session, user }: any) {
      // Adicionar informações da org na sessão
      if (session.user?.email) {
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
    }
  }
};

const handler = NextAuth(authConfig);

export { handler };