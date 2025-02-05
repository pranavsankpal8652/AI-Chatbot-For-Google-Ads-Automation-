
// Store user sessions
const userSessions = {};
let socketdata=(io,genAI)=>{
    io.on("connection", async (socket) => {
        console.log("User connected:", socket.id);
        socket.emit('bot-message','Responding...',true)
    
        try {
            // Initialize Gemini AI chat session
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
            const chatSession = model.startChat();
            
            // Store session data
            userSessions[socket.id] = {
                chat: chatSession,
                responses: [] ,// Store user responses
                currentQuestionIndex:0,
                awaitConfirmation:false
            };
    
            // First AI-generated question
            const firstPrompt = `You are an AI assistant helping users fill out a Google Ads campaign form. 
    Start by asking for the business name.  
    Then, ask only the **required** questions necessary to set up the campaign fully.  
    Ask questions one by one, based on user responses, and **don't miss any essential question to fill google ad campaign fully like 1. 1.1.1.Business Name  
    2. Keywords  
    3. Daily Budget  
    4. Target Location  
    5. Campaign Type (Search, Display, Video, Shopping, Performance Max)  
    6. Ad Headline (Max 30 characters)  
    7. Ad Description (Max 90 characters)  
    8. Campaign Duration (Start & End Date or Continuous)**. 
    9.Target Audience
    10.Website URL 
    11.Campaign Goal (Leads, Website Traffic, Sales)  
    Once all the required information is collected, **ask the user to confirm their details**.  
    If the user confirms, stop asking questions. If they need modifications, adjust accordingly.  
    Keep your questions **short, direct, and to the point** without excessive explanations`;
            const aiResponse = await chatSession.sendMessage(firstPrompt);
            
            const question = aiResponse.response.text(); // Get AI response text
            userSessions[socket.id].responses.push({question:question,answer:null})
            socket.emit("bot-message", question,false);
    
    
        } catch (error) {
            console.error("Error initializing chatbot:", error);
            socket.emit("bot-message", "Sorry, something went wrong. Please try again.");
        }
    
        // Handle user messages
        socket.on("user-message", async (message) => {
            if (!userSessions[socket.id]) return;
            socket.emit('bot-message','Responding...',true)
    
    
            try {
                // Save user response
                const sessions =userSessions[socket.id]
                sessions.responses[sessions.currentQuestionIndex].answer = message;
                if(sessions.awaitConfirmation)
                {
                    if(message.toLowerCase().includes('yes') || message.toLowerCase().includes('yes confirm')){
                        
                        socket.emit('bot-message',"Thank-You your data has been recorded")
                        socket.emit('data',sessions.responses)
                        delete userSessions[socket.id]
                        return
                    }
                }
                
    
                // Send user response to AI for next question
                const chatSession = userSessions[socket.id].chat;
                const aiResponse = await chatSession.sendMessage(message);
                
                const nextQuestion = aiResponse.response.text();
                if (nextQuestion.toLowerCase().includes('please confirm') || nextQuestion.toLowerCase().includes('confirm your details')) {
                    sessions.awaitConfirmation = true;
                }
                sessions.responses.push({question:nextQuestion,answer:null})
                ++sessions.currentQuestionIndex;
                socket.emit("bot-message", nextQuestion,false);
                // console.log(sessions.responses)
    
            } catch (error) {
                console.error("Error in AI response:", error);
                socket.emit("bot-message", "Sorry, I couldn't process that. Try again.");
            }
        });
    
        // Handle user disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            delete userSessions[socket.id]; // Cleanup
        });

    });
}
module.exports={socketdata,userSessions}