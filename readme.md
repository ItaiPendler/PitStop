PitStop

currently i track my cars fuel intake and kilometers driven on the fuel receipt, for each fueling i record the date, the amount of fuel added, the price, and the odometer reading. and calculate the fuel efficiency based on this data (kilometers per liter).

i want to stop using paper receipts and manual calculations for tracking my car's fuel efficiency. and i want my partner to also be able to see the info on their phone.

a website for tracking stuff about your car.
a collaborative website that connects to a shared GOOGLE SHEET. This way, the website doesn't store anything itself, and multiple people can access and update the same information.
If the SHEET is empty: the website will inject a basic structure with information about the car and a template for storing car-related data.
If the SHEET already contains the appropriate structure, the information will be displayed in a user-friendly manner.

pages:
main page: car details and fuel efficiency of last fueling in a big display, along with a list of previous fueling and their details.
add fueling page: a form for adding a new fueling, including date, amount of fuel, price, and odometer reading.
settings page: a page for managing car details, such as make, model, year, and license plate number. you can also switch between different cars if you have more than one (different cars are stored in the same google SHEET on different sheets).
statistics page: a page displaying various statistics about the car's fuel efficiency over time, such as average fuel consumption, total distance driven, and total fuel used.
about page: a page providing information about the website, its purpose, and how to use it.
statistics page: a page displaying various statistics about the car's fuel efficiency over time, such as average fuel consumption, total distance driven, and total fuel used.

design:
the website will have a clean and simple design, focusing on usability and ease of access to the car's fuel efficiency data. the main page will prominently display the most recent fueling information, while other pages will provide forms and statistics in an organized manner. the design will be responsive, ensuring a good user experience on both desktop and mobile devices.

SHEET STRUCTURE:
each sheet represents a car.
first table is car info, including make, model, year, and license plate number.
the second table is for fueling records, including: date, amount of fuel added, price, and odometer reading, with a calculated field for fuel efficiency for each fueling. (this will take a load off the website, as it won't need to calculate fuel efficiency itself.)

how to connect to a GOOGLE SHEET:
use the Google Sheets API to authenticate and access the sheet. you will need to create a project in the Google Cloud Console, enable the Sheets API, and obtain the necessary credentials (API key or OAuth 2.0 client ID). then, use the API to read and write data to the sheet from your website.

authentication and authorization:
i want the users to use their Google accounts to authenticate and authorize access to the shared Google Sheet. this way, only authorized users can view and modify the data, and the website doesn't need to manage its own authentication system.
this can be achieved using the Google Sign-In API, which allows users to sign in with their Google accounts and grants the necessary permissions to access the Google Sheet. the website will then use the obtained access token to interact with the Google Sheets API on behalf of the authenticated user.

deployment:
the website will be deployed on github pages, making it easily accessible to all authorized users without the need for a dedicated server.
