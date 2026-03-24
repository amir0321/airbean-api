import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Airbean API is running');
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});