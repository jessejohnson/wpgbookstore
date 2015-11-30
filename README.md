How it works:

1. Get static list of book objects
2. onClick, let user enter phone number, location
3. Generate order code
4. Instruct user to pay amount to mobile money merchant and include order code
5. Send order request to WPG
	a. order contains order code, date&time, book
6. When user pays with order code, inform user order went through via phone number