import { Request, Response } from "express";

interface LoginRequestBody {
  password: string;
}

class AuthController {
  static async login(req: Request<{}, {}, LoginRequestBody>, res: Response) {
    const { password } = req.body;
    const VALID_PASSWORD = process.env.ADMIN_PASSWORD || "shahul@123";

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (password === VALID_PASSWORD) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  }
}

export default AuthController;
