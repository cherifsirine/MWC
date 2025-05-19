require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/submit', async (req, res) => {
    // ✅ Correctly reading incoming data based on your frontend's structure
    const { Title, Date, Candidat, Pr_x00e9_sent } = req.body;

    console.log("✅ Received values:", { Title, Date, Candidat, Pr_x00e9_sent });

    const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
    const resourceUrl = `https://graph.microsoft.com/v1.0/sites/${process.env.SITE_ID}/lists/${process.env.LIST_ID}/items`;

    console.log("✅ Posting to:", resourceUrl);

    try {
        const tokenResponse = await axios.post(tokenUrl, new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials"
        }));

        const token = tokenResponse.data.access_token;
        console.log("✅ Token received.");

        const response = await axios.post(resourceUrl, {
            fields: {
                Title: Title,
                Date: Date,
                Candidat: Candidat,
                Pr_x00e9_sent: Pr_x00e9_sent
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ Data written to SharePoint:", response.data);
        res.send(response.data);

    } catch (error) {
        console.error("❌ Error details:", error.response?.data || error.message);
        res.status(500).send("Failed to submit data");
    }
});

// ✅ Server start confirmation
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
