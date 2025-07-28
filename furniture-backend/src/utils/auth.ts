export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("This phone has already been registered");
    error.status = 409;
    error.code = "Error_AlreadyExist";
    throw error;
  }
};

export const checkOtpErrorSameDate = (
  isSameDate: boolean,
  errorCount: number
) => {
  if (isSameDate && errorCount === 5) {
    const error: any = new Error(
      "You have reached the maximum OTP error limit for today. Please try again tomorrow."
    );
    error.status = 429;
    error.code = "Error_RateLimitExceeded";
    throw error;
  }
};

export const checkOtpRow = async (otp: any) => {
  if (!otp) {
    const error: any = new Error("Phone number is not registered");
    error.status = 400;
    error.code = "Error_Invalid";
    throw error;
  }
};
