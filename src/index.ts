import express from "express";
import { config } from "dotenv";
config();
async function main() : Promise<void> {
   
    const app = express();
    app.use(express.json());

   

    const PORT = process.env.PORT as string;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

}
main().catch((err) => {
    console.error("Error during main execution:", err);
});
