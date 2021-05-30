function scanMail() {
  
  // Log the subject lines of up to the first 50 emails in Inbox
  var threads = GmailApp.getInboxThreads(0, 50);
  var subject = "EXAMPLE SUBJECT LINE";
  for (var i = 0; i < threads.length; i++) {
    var inboxSubject = threads[i].getFirstMessageSubject();
    var messageDate = Utilities.formatDate(threads[i].getLastMessageDate(), "GMT", "dd-MM-yyyy");
    var today = Utilities.formatDate(new Date(), "GMT", "dd-MM-yyyy");
    
    // Check if email is from today
    if (messageDate == today) {
      // If subject line matches subject above, read message
      if (inboxSubject == subject) {
        var message = threads[i].getMessages()[0];
        var text = message.getPlainBody();
        
        // Get details from message
        var firstName = text.match(/:\s(.*)/g)[0].split(":")[1].slice(1).split(" ")[0];
        var lastName = text.match(/:\s(.*)/g)[0].split(":")[1].slice(1).split(" ")[1];
        var emailAddress = text.match(/:\s(.*)/g)[1].split(":")[1].slice(1);
        var newsletter = text.match(/:\s(.*)/g)[4].split(":")[1].slice(1);

        // Check if they want to subscribe to newsletter
        if (newsletter.length == 10) {
          // Call function to add contact to MailChimp
          addContact(firstName, lastName, emailAddress);
        } else {
          continue;
        }

      } else {
        continue;
      }
    } else {
      continue;
    }

  }
}

function addContact(firstName, lastName, emailAddress) {
  var api_key = "YOUR_API_KEY";
  var serverName = "SERVER_NAME"; //i.e. us18
  var listID = "MAILCHIMP_LIST_ID";
  var url = "https://" + serverName + ".api.mailchimp.com/3.0/lists/" + listID + "/members";
  
  // create data payload for MailChimp API
  var data = {
    "email_address": emailAddress,
    "status": "subscribed",
    "email_type": "html",
    "merge_fields": {
      "FNAME": firstName,
      "LNAME": lastName
    },
    "tags": ["website-contact-form"]
  }

  var options = {
    "method": "POST",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization": "apikey " + api_key
     },
     "payload": JSON.stringify(data)
  };
  
  try{
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getResponseCode());
    var json = JSON.parse(response);
    Logger.log(json);
  }
  catch(error){
    Logger.log(error);
  }
}
