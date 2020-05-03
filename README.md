# Stock-Analysis
[Project] Analyze your stock portfolio! 

Practice project using JavaScript/Sass frontend and Node.js/Express backend. The original assignment was from Udacity's Front End Nanodegree Program, which asked students to create a custom travel application. I diverged from the original prompt and created an application with the following features:

Features:

        Security Search:
                - Users can search for securities by symbol and are shown a list of matching symbols returned by the Alpha Vantage API. 
                - When the user clicks on one of the symbols in this list, they will be shown a card containing information about the security.

        Quote Cards:
                - Users can view a list of recently searched securities, which are presented to the users as cards. 
                - Users can refresh the card and fetch the latest data for any searched security every 15 minutes.

        To Implement:
                - Users can clear recently searched securities, as well as add and un-watch securities of their choice. Watched securities will be persisted across user sessions.
                - Users can view detailed insights about each security, including a  news feed and sentiment analysis on the security.

        APIs used: 
                Alpha Vantage: https://www.alphavantage.co
                Aylien: https://developer.aylien.com
                News API: https://newsapi.org/

To get Webpack running:

        npm run build 
        npm start