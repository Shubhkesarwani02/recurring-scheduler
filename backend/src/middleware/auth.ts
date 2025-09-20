import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId?: string;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For now, extract user ID from token (in production, verify JWT properly)
  const token = authHeader.substring(7);
  
  try {
    // Simple token parsing for development (replace with proper JWT verification)
    // In production, use Clerk's verification
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    req.auth = {
      userId: payload.sub || 'default-user',
      sessionId: payload.sid,
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.auth = {
        userId: payload.sub || 'default-user',
        sessionId: payload.sid,
      };
    } catch (error) {
      console.error('Optional auth failed:', error);
    }
  }
  
  next();
};