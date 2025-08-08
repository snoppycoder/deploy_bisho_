import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    console.log('Test auth endpoint called with:', { identifier, password });

    // Make request to backend
    const backendUrl = 'https://bisho-backend-2.onrender.com';
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();
    
    console.log('Backend response:', data);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Authentication failed',
        status: response.status
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 