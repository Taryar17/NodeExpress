import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const getUserbyPhone = async (phone: string) => {
  return prisma.user.findUnique({ where: { phone } });
};

export const createOtp = async (otpData: any) => {
  return prisma.otp.create({ data: otpData });
};

export const getOtpbyPhone = async (phone: string) => {
  return prisma.otp.findUnique({
    where: { phone },
  });
};

export const updateOtp = async (id: number, otpData: any) => {
  return prisma.otp.update({
    where: { id },
    data: otpData,
  });
};
