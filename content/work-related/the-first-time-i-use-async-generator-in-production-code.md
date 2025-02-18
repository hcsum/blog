# The first time I use async generator in production code

Date created: 2025-02-14

I used to work for a company that provides exhibition and social event management services. A core feature of our SAAS platform is allowing user to launch email campaigns. Without statistics, client won't be able to know how their email campaigns perform. So my task was to build a dashboard that allows user to view the statistics of their campaigns.

We use SendGrid as our email service provider, and the events are collected via webhooks. SendGrid email events are triggered every time an event happens, such as an email is delivered, opened, clicked, or bounced. Each event is associated with a recipient and that one email sent. And one email campaign will send out a copy of the same email to hundreds of thousands of attendees (each with custom fields specified to the recipient of course). Sendgrid often batch email events together, meaning each webhook call can contain a few events, may or may not be related to the same recipient.

I need to build a system that can process these events in real-time, store the data in our database, and provide a dashboard for the client to view the statistics. And doing this without creating too much load on the database.

We decided to save each batch of the SendGrid email events in S3 bucket as a JSON file. Then we process the events in a separate service.

to be continued...
