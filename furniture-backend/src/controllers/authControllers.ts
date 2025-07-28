import { Request, Response, NextFunction } from "express";
import { body, check, validationResult } from "express-validator";
import { getUserbyPhone } from "../services/authService";
import { checkUserExist } from "../utils/auth";
import { generateOTP } from "../utils/generate";
import { createOtp } from "../services/authService";
import { generateToken } from "../utils/generate";
import bcrypt from "bcrypt";
import { getOtpbyPhone } from "../services/authService";
import { checkOtpErrorSameDate } from "../utils/auth";
import { updateOtp } from "../services/authService";
import { checkOtpRow } from "../utils/auth";
import moment from "moment";

// 09778661265
export const register = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches(/^\d+$/)
    .isLength({ min: 8, max: 12 })
    .withMessage(
      "Phone number must be between 8 and 12 digits and contain only numbers."
    ),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      //console.log({ errors: errors[0].msg });
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = "Error_Invalid";
      return next(error);
    }
    let phone = req.body.phone;

    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }

    const user = await getUserbyPhone(phone);
    checkUserExist(user);

    // OTP sending logic would go here
    // Generate OTP and call OTP sending API
    // if sms OTP cannot be sent, throw an error
    // Save OTP to DB

    const otp = 123456; // For testing purposes, replace with generateOTP() in production
    // const otp = generateOTP();
    const token = generateToken();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);

    const otpRow = await getOtpbyPhone(phone);

    let result;
    if (!otpRow) {
      const otpData = {
        phone,
        otp: hashedOtp,
        rememberToken: token,
        count: 1,
      };
      result = await createOtp(otpData);
    } else {
      const lastOtpRequest = new Date(otpRow.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleTimeString();
      const isSameDate = lastOtpRequest === today;
      checkOtpErrorSameDate(isSameDate, otpRow.error);
      if (!isSameDate) {
        const otpData = {
          otp: hashedOtp,
          rememberToken: token,
          count: 1,
          error: 0,
        };
        result = await updateOtp(otpRow.id, otpData);
      } else {
        if (otpRow.count === 3) {
          const error: any = new Error("OTP request limit reached for today");
          error.status = 400;
          error.code = "Error_OverLimit";
          return next(error);
        } else {
          const otpData = {
            otp: hashedOtp,
            rememberToken: token,
            count: otpRow.count + 1,
          };
          result = await updateOtp(otpRow.id, otpData);
        }
      }
    }
    // const lastOtpRequest = new Date(result.updatedAt).toLocaleDateString();
    // const today = new Date().toLocaleTimeString();
    // const isSameDate = lastOtpRequest === today;
    res.status(200).json({
      // samedate: isSameDate,
      otp: result.otp,
      message: `We are sending OTP to 09${result.phone}`,
      phone: result.phone,
      rememberToken: result.rememberToken,
    });
  },
];

export const verifyOtp = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches(/^\d+$/)
    .isLength({ min: 8, max: 12 })
    .withMessage(
      "Phone number must be between 8 and 12 digits and contain only numbers."
    ),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .isNumeric()
    .isLength({ min: 6, max: 6 }),
  body("rememberToken", "Invalid remember token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = "Error_Invalid";
      return next(error);
    }
    const { phone, otp, rememberToken } = req.body;
    const user = await getUserbyPhone(phone);
    checkUserExist(user);
    const otpRow = await getOtpbyPhone(phone);
    checkOtpRow(otpRow);
    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleTimeString();
    const isSameDate = lastOtpVerify === today;
    checkOtpErrorSameDate(isSameDate, otpRow!.error);

    if (otpRow?.rememberToken !== rememberToken) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      const error: any = new Error("Invalid remember token");
      error.status = 400;
      error.code = "Error_InvalidToken";
      return next(error);
    }
    // Otp is expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 2;
    if (isExpired) {
      const error: any = new Error("OTP is expired");
      error.status = 403;
      error.code = "Error_Expired";
      return next(error);
    }

    const isMatchOtp = await bcrypt.compare(otp, otpRow!.otp);
    //OTP is wrong
    if (!isMatchOtp) {
      //if Otp error is first time today
      if (!isSameDate) {
        const otpData = {
          error: 1,
        };
        await updateOtp(otpRow!.id, otpData);
      } else {
        const otpData = {
          error: { increment: 1 },
        };
        await updateOtp(otpRow!.id, otpData);

        const error: any = new Error("OTP is wrong");
        error.status = 403;
        error.code = "Error_WrongOtp";
        return next(error);
      }
    }

    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };
    const result = await updateOtp(otpRow!.id, otpData);
    res.json({
      phone: result.phone,
      verifyToken: result.verifyToken,
    });
  },
];
export const confirmPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
