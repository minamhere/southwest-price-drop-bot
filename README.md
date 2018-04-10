# southwest-price-drop-bot


This tool lets you monitor the price of Southwest flights that you've booked. It will notify you if the price drops below what you originally paid. Then you can [re-book the same flight](http://dealswelike.boardingarea.com/2014/02/28/if-a-southwest-flight-goes-down-in-price/) and get Southwest credit for the price difference.

Note that you need to have a [Plivo](https://www.plivo.com) account to send the text message notifications and a [Mailgun](https://www.mailgun.com) account to send the email notifications. You can run this without these accounts, but you won't get the notifications.

You can log in with either:

- The admin username/password combo, example: `admin` and `the-admin-password-123`
- A username/password combo, example: `non` and `the-admin-password-123`

The second option is nice when giving out access to friends and family since it will only display alerts for the given username.  Note that the password is the same for all accounts, and the admin can see all alerts.

When creating alerts, note that the email and phone numbers are optional. If those are both left blank, the user will need to manually log in to view price drops.

## Deployment

1. Click this button: [![deploy][deploy-image]][deploy-href]
1. Fill out the config variables and click `Deploy`
1. Open up the `Heroku Scheduler` from your app's dashboard
1. Add an hourly task that runs `npm run task:check`

When updates become available, you will have to deploy them yourself using the [Heroku CLI](https://devcenter.heroku.com/articles/git).  This app follows [SemVer](http://semver.org/) in its versioning, so make sure to read the release notes when deploying a major version change.


## Screenshots

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/web-list.png">
    <img src="./screenshots/web-list.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/web-detail.png">
    <img src="./screenshots/web-detail.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/email-alert.jpeg">
    <img src="./screenshots/email-alert.jpeg" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/sms.png">
    <img src="./screenshots/sms.png" height="400" />
  </a>
</kbd>

## Attribution

This is a fork of [minamhere's fork](https://github.com/minamhere/southwest-price-drop-bot) of [maverick915's fork](https://github.com/maverick915/southwest-price-drop-bot) of [scott113341's original project](https://github.com/scott113341/southwest-price-drop-bot).
Downstream changes were integrated from:
  * [PetroccoCo](https://github.com/PetroccoCo/southwest-price-drop-bot) - Email Handling
  * [pmschartz](https://github.com/pmschartz/southwest-price-drop-bot) - Redesign


[deploy-image]: https://www.herokucdn.com/deploy/button.svg
[deploy-href]: https://heroku.com/deploy
