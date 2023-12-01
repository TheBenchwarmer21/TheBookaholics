![alt text](/All_Project_Code_And_Components/resources/img/zz.png?raw=true)
# <p align="center"> The Bookaholics </p>


## Brief Application Description
This application will offer users the ability to transverse books that they are able to read and give a review to, given the collection of a collection of books that Google Books provides to choose from. Able to see other reviews from other users as well!


## Contributors
<a href="https://github.com/TheBenchwarmer21/TheBookaholics/graphs/contributors">
 <img src="https://contrib.rocks/image?repo=TheBenchwarmer21/TheBookaholics" />
</a>


- twisty13 (Tristan Barnes)
- cothiel (Cooper Thiel)
- TheBenchwarmer21 (Oscar Guerrero)
- yusefbaluch (Yusef Albalushi)
- suman421159 (Suman Upreti)
- bennettgarmon (Ben Garmon)

## Note for Cybersecurity Team or Individual
DO NOT DOWNLOAD LATEST VERSION. We have a stable version within a tag (found on right side of screen) titled: CSCI3403 -- USE THIS VERSION. Download zip file and open it. You will still need to follow along the instructions under "Instructions On How To Run The Application Locally" as you need to create an API key but you can skip step 2.
Please do not hesitate to contact one of the team members from the project for any questions or elaborations of the application via email: osgu7204@colorado.edu

## Technology Stack Used


Used the following tools:


- VCS Repository: Github
- IDE: Visual Studios
- Database: PostgreSQL
- UI Tools: HTML, EJS, CSS
- Deployment Environment: Microsoft Azure
- Application Server: NodeJS
- External APIs: Google Books
- Testing Tool: Chai


## Prerequisites To Run The Application


- Have Docker compose running before running the application.


## Instructions On How To Run The Application Locally
1. First you must create an Google Book API key by going to the following link: https://developers.google.com/books/docs/v1/using#APIKey
- Within the link, click on "Create Credentials" hyperlink
![alt text](/All_Project_Code_And_Components/resources/img/Step1.png?raw=true)
- Note that you will be prompted to sign in to Google account, accept terms, and create a project(name it whatever you want)
- Then click on "Create credentials", there will be a dropdown and click "API KEY"
![alt text](/All_Project_Code_And_Components/resources/img/Step2.png?raw=true)
![alt text](/All_Project_Code_And_Components/resources/img/Step3.png?raw=true)
- You will then be given an API key for which you need to save.
![alt text](/All_Project_Code_And_Components/resources/img/Step4.png?raw=true)
- Here is a youtube video that goes through the process in case you get lost(Starts at "Create credentials" step). Link: https://www.youtube.com/watch?v=LXG_MnQPZiw
2. Now open a client of your choice, such as Terminal on Mac or WSL on Windows and clone project to local maching (via SSH):
``` sh
git clone git@github.com:TheBenchwarmer21/TheBookaholics.git
```
3. Navigate to repository in your system and enter directory "All_Project_Code_And_Components":
``` sh
cd TheBookaholics
cd All_Project_Code_And_Components
```


4. Create and enter file titled ".env" using 
Mac command
``` sh
vi .env
```
or Windows:
``` sh
notepad .env
```
5. Copy and paste the following code to your .env file, replace "ADD KEY HERE" with your newly created Google Book API key. Save file:


``` sh
# database credentials
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="users_db"


SESSION_SECRET="super duper secret!"
# Make Google Books API key here:
API_KEY="<ADD KEY HERE>"
```
6. Start Docker Desktop Application
7. Run the following command for Docker to create a container for the application:
``` sh
docker-compose up
```
8. Should have application running when you get the following message in console "Database connection successful" as shown in image below
![alt text](/All_Project_Code_And_Components/resources/img/readyMessage.png?raw=true)
9. Now just enter the following link into whichever browser of your choosing and you should see the web application running
``` sh
http://localhost:3000/
```

## How To Run The Tests


In the docker-compose.yaml file under All_Project_Code_And_Components folder, replace line 24:


```yaml
command: 'npm start'
```


with the following line:


```yaml
command: 'npm run testandrun'
```


After this, run the application as you would normally (to be specified later)
## Link To The Deployed Application
Enter the following link into whichever browser of your choosing and you should see the web application running
``` sh
http://recitation-14-team-05.eastus.cloudapp.azure.com:3000/
```
