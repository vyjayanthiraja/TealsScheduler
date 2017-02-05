<h1>Usage guide</h1>
<h2>Setup</h2>
<ol>
<li>Create a Google Console API key using the instructions here : https://developers.google.com/identity/sign-in/web/devconsole-project
   (You only need to do this once)</li>
<li>Edit the client_secret.json file to replace the client_id and client_secret fields with the values you obtained in step 1</li>
</ol>
<h2>Scheduling classes</h2>
<ol>
<li>Edit the scheduleconfig.json file to configure the teaching schedule</li>
<li>Usage: node teachingscheduler.js schedule scheduleconfig.json</li>
</ol>
<h2>Deleting classes</h2>
<ol>
<li>Edit the deleteconfig.json file to configure the teaching schedule</li>
<li>Usage: node teachingscheduler.js delete deleteconfig.json</li>
</ol>
