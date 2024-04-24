//Source: https://www.youtube.com/watch?v=5K5gIznvJkc

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express().use(bodyParser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN; // prasath_token

app.listen(process.env.PORT, () => {
    console.log("webhook is listening");
});

// to verify the callback URL from the dashboard side - cloud API side
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"];
    let verifyToken = req.query["hub.verify_token"];

    if (mode && verifyToken) {
        if (mode === "subscribe" && verifyToken === mytoken) {
            res.status(200).send(challange);
        } else {
            res.status(403);
        }
    }
});

app.post("/webhook", (req, res) => {
    let body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        console.log("inside body param");
        if (
            body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

            console.log("phone number " + phon_no_id);
            console.log("from " + from);
            console.log("body param " + msg_body);

            axios({
                method: "POST",
                url: `https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}`,
                //Our message body
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: "Hi.. I'm Prasath, your message is " + msg_body,
                    },
                },
                headers: {
                    "Content-Type": "application/json",
                },
            });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});

app.get("/", (req, res) => {
    res.status(200).send("hello this is webhook setup");
});
