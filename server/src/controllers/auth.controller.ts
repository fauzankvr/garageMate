   
    class AuthController {
//   static async signup(req: Request, res: Response) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { phoneNumber, password } = req.body;
//       const { user, token } = await AuthService.signup(phoneNumber, password);
//       res.status(201).json({ user: { _id: user._id, phoneNumber: user.phoneNumber }, token });
//     } catch (error: any) {
//       res.status(400).json({ error: error.message });
//     }
//   }

 static async login(req: Request, res: Response) {
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

export default AuthController