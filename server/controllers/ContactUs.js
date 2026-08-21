const mailSender = require("../utils/mailSender");

exports.contactUs = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required",
            });
        }

        // -----------------------------
        // Email to User
        // -----------------------------

        const userEmailBody = `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">

                <h2 style="color: #333;">
                    Thank You, ${name}!
                </h2>

                <p>
                    Your message has been successfully sent to the
                    <strong>StudyNotion Contact Team</strong>.
                </p>

                <p>
                    Our team will review your message and get back to
                    you as soon as possible.
                </p>

                <hr />

                <h3>Your Message</h3>

                <p>
                    <strong>Subject:</strong>
                    ${subject || "No Subject"}
                </p>

                <p>
                    <strong>Message:</strong>
                </p>

                <div style="
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                ">
                    ${message}
                </div>

                <br />

                <p>
                    Regards,<br />
                    <strong>StudyNotion Team</strong>
                </p>

            </div>
        `;

        await mailSender(
            email,
            "Your message has been received - StudyNotion",
            userEmailBody
        );


        // -----------------------------
        // Email to Contact Team
        // -----------------------------

        const teamEmailBody = `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 700px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">

                <h2 style="color: #333;">
                    New Contact Us Message
                </h2>

                <hr />

                <h3>User Details</h3>

                <p>
                    <strong>Name:</strong> ${name}
                </p>

                <p>
                    <strong>Email:</strong> ${email}
                </p>

                <p>
                    <strong>Subject:</strong>
                    ${subject || "No Subject"}
                </p>

                <h3>Message</h3>

                <div style="
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                ">
                    ${message}
                </div>

                <br />

                <p>
                    This message was submitted through the
                    <strong>StudyNotion Contact Us</strong> form.
                </p>

            </div>
        `;

        await mailSender(
            process.env.CONTACT_TEAM_EMAIL,
            `New Contact Us Message - ${subject || "No Subject"}`,
            teamEmailBody
        );


        // -----------------------------
        // Success Response
        // -----------------------------

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (error) {
        console.error("Error in contactUs:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending the message",
            error: error.message,
        });
    }
};