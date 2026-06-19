import express from 'express';
import { initDB } from "./utils/db" ;
import { authRoutes } from  "./routes" ;

const app = express();
const port = 3000;
app.use(express.json());

async function main() {
  await initDB();

  app.use('/api/auth', authRoutes);

  app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });

  app.listen(port, () => {
    console.log(`Server on http://localhost: ${port}`);
  });
}

main().catch(console.error);