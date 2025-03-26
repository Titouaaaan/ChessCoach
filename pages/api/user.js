import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]'; // Adjust path if necessary

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  }

  if (req.method === 'POST') {
    let { name, chessLevel, bio, profilePic, preferences } = req.body;
  
    // Ensure chessLevel is an integer or null
    chessLevel = chessLevel ? parseInt(chessLevel, 10) : null;
    if (isNaN(chessLevel)) chessLevel = null; // Handle conversion errors
  
    try {
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: { name, chessLevel, bio, profilePic, preferences },
      });
  
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('❌ Prisma update error:', error);
      return res.status(500).json({ error: `Error updating user: ${error.message}` });
    }
  }
  

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
