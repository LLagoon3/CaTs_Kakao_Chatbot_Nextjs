// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: apiUrl });
}
