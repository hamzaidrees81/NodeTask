const app = require('./app');
const middleware = require('./middleware/getProfile')
const getAllProfiles = middleware.getAllProfiles;
const getProfile = middleware.getProfile;

init();

app.get('/', (req,res) => 
{
  console.log('Hello');

  res.status(200).json('Hello called');
}
)


app.get('/auth', getProfile, async (req,res) => 
{


  const {Profile} = req.app.get('models')
  try {
  const profiles = await Profile.findAll()
  if(!profiles || profiles.length === 0)
   return res.status(401).end()
  
  res.status(200).json(profiles);

   
  } catch (error) {
      console.error(error);
      return res.status(500).end(); // Handle any errors that occur during retrieval
  }
 
  

}
)

app.get('/authenticate', async (req,res) => 
{


  const {Profile} = req.app.get('models')
  try {
  const profiles = await Profile.findAll()
  if(!profiles || profiles.length === 0)
   return res.status(401).end()
  
  res.status(200).json(profiles);

   
  } catch (error) {
      console.error(error);
      return res.status(500).end(); // Handle any errors that occur during retrieval
  }
 
  

}
)


async function init() {
  try {
    app.listen(3001, () => {
      console.log('Express App Listening on Port 3001');
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
