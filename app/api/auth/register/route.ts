import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateNickname,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nickname, turnstileToken } = body;

    // Verify Turnstile
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Bot verification required" },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Bot verification failed" },
        { status: 400 }
      );
    }

    // Validate inputs
    const sanitizedEmail = sanitizeInput(email || "").toLowerCase();
    const sanitizedNickname = sanitizeInput(nickname || "");

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!validatePassword(password || "")) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!validateNickname(sanitizedNickname)) {
      return NextResponse.json(
        {
          error:
            "Nickname must be 3-20 characters, alphanumeric and underscores only",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: sanitizedEmail }, { nickname: sanitizedNickname }],
      },
    });

    if (existingUser) {
      if (existingUser.email === sanitizedEmail) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Nickname already taken" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        nickname: sanitizedNickname,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
