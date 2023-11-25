const app = require('./app');
const middleware = require('./middleware/getProfile')

const getAllProfilesMiddleware = middleware.getAllProfiles;

init();

app.get('/', (req,res) => 
{
  console.log('Hello');

  res.status(200).json('Hello called');
}
)

app.get('/authenticate', getAllProfilesMiddleware, (req,res) => 
{

  const profiles = req.profiles;

  console.log('Hello');

  res.status(200).json({ message: 'Hello called', profiles });
}
)


async function init() {
  try {
    await app.listen(3001, () => {
      console.log('Express App Listening on Port 3001');
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
