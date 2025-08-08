import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic connectivity
    const response = await fetch('https://bisho-backend-2.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: '202',
        password: 'password123'
      }),
    });

    console.log('Backend response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend response data:', data);
      return NextResponse.json({
        success: true,
        message: 'Backend connection successful',
        data: data
      });
    } else {
      const errorData = await response.text();
      console.log('Backend error response:', errorData);
      return NextResponse.json({
        success: false,
        message: 'Backend connection failed',
        status: response.status,
        error: errorData
      });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 