const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const request = require('request');
const config = require('config');
const User = require('../../models/User');
const Profile  = require('../../models/Profile');
const Post = require('../../models/Post')
const { check, validationResult } = require('express-validator');



router.get('/me', auth , async (req,res) =>{

    try{

        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',['name', 'avatar']
        );

        if(!profile){
            return res.status(400).json({ msg: 'Thir is no profile for this user'})
        }
        res.json(profile);


    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

// post data

router.post('/', [ auth, [
    check('status', 'status is reqired').not().isEmpty(),
    check('skills', 'skills is reqired').not().isEmpty(),
] ], async (req, res, ) =>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        return res.status(400).json({ errors: errors.array() });

    }
     const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;


    // built profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    
    if(skills){
        profileFields.skills = skills.split(',').map(skills => skills.trim());   
    }

    // social object
    profileFields.social  = {};
    if(youtube) profileFields.youtube = youtube;
    if(twitter) profileFields.twitter = twitter;
    if(facebook) profileFields.facebook = facebook;
    if(linkedin) profileFields.linkedin = linkedin;
    if(instagram) profileFields.instagram = instagram;
    
    try{
        let profile = await Profile.findOne({user : req.user.id})
        if(profile){
            profile  = await Profile.findOneAndUpdate(
                {user : req.user.id},
                {$set : profileFields },
                { new : true }
                );

                return res.json(profile);
        }

        // create profile
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);


    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    // console.log(profileFields.skills);
    res.send('hello');

}
);


// get profile

router.get('/', async (req,res) =>{

    try {

        const profiles = await Profile.find().populate('user', ['name', 'avatar']); 
        res.json(profiles);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');   
    }

});


// get profile user and userid

router.get('/user/:user_id', async (req,res) =>{

    try {

        const profile = await Profile.findOne({ user : req.params.user_id}).populate('user', ['name', 'avatar']); 

        if(!profile){
            return   res.status(400).json({ msg: 'Profile not found'});   
        };


        res.json(profile);
        
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return   res.status(400).json({ msg: 'Profile not found'});   
        }
        res.status(500).send('Server Error');   
    }

});

// delete profile

router.delete('/',auth  ,async (req,res) =>{

    try {

        // deleted all post user 
        await Post.deleteMany({ user: req.user.id })

        // remove thir profile
        await Profile.findOneAndRemove({ user: req.user.id }) 
        
        // remove user
        await User.findOneAndRemove({ _id: req.user.id }) 

        res.json({ msg : "User deleted " });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');   
    }

});


// profile exprience put

router.put('/experience', [auth, [
    check('title', 'Title is  required').not().isEmpty(),
    check('company', 'Company is  required').not().isEmpty(),
    check('from', 'From date is  required').not().isEmpty(),

] ]  ,async (req,res) =>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, company, location, from, to, current, description } = req.body;

    const newExp = { title, company, location, from, to, current, description }

    try {
        
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');   
    }


});

// experience delete

router.delete('/experience/:exp_id', auth, async (req,res) =>{
    
try {
    
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);


} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
}    


});


// education add 


router.put('/education', [auth, [
    check('school', 'School is  required').not().isEmpty(),
    check('degree', 'Degree is  required').not().isEmpty(),
    check('fieldofstudy', 'Fieldofstudy date is  required').not().isEmpty(),
    check('from', 'From date is  required').not().isEmpty(),

] ]  ,async (req,res) =>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        return res.status(400).json({ errors: errors.array() });
    }
    
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    const newEdu = { school, degree, fieldofstudy, from, to, current, description }

    try {
        
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');   
    }


});



// education delete

router.delete('/education/:edu_id', auth, async (req,res) =>{
    
    try {
        
        const profile = await Profile.findOne({ user: req.user.id });
    
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
    
        profile.education.splice(removeIndex, 1);

        await profile.save();    
    
        res.json(profile);
    
    
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }    
    
    
    });


// userrepo on github

router.get('/github/:username', (req,res) =>{

    try {
        
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=
            ${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if(response.statusCode !== 200){
                return res.status(404).json({ msg: 'No gitgub profile found' })
            }
            res.json(JSON.parse(body));
        });


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }

});



    


module.exports = router;