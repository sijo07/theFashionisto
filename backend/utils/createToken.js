import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  try {
    console.log("Generating JWT token for userId:", userId);
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Exists" : "Missing");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    
    console.log("JWT token generated successfully");
    
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    console.log("JWT cookie set successfully");
    
    return token;
  } catch (error) {
    console.error("Error in generateToken:", error);
    console.error("Error details:", {
      userId,
      jwtSecretExists: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    });
    throw new Error("Failed to generate authentication token");
  }
};

export default generateToken;