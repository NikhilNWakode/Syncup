import Channel from "../models/ChannelModel.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";



export const createChannel = async (req,res,next) => {
    try{
        const {name,members} = req.body;
        const userId = req.userId;

        const admin = await User.findById(userId);

        if(!admin) {
            return res.status(400).send("Admin user not found.");

        }

        const validMembers = await User.find({_id : {$in: members}});

        if(validMembers.length !== members.length){
            return res.status(400).send("Some members are not valid users.");
        }

        const newChannel = new Channel ({
            name,
            members,
            admin:userId,
        });

        await newChannel.save();
        return res.status(201).json({channel:newChannel});

    }
    catch(error){
        console.log({error});
        return res.status(500).send("Internal Server Error");
    }
}


export const getUserChannels = async (req, res, next) => {
    try {
        console.log("User ID:", req.userId);  // Log the user ID

        const userId = new mongoose.Types.ObjectId(req.userId);

        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }],
        }).sort({ updatedAt: -1 });

        console.log("Fetched Channels:", channels);  // Log fetched channels

        return res.status(200).json({ channels });
    } catch (error) {
        console.error("Error fetching user channels:", error);  // Log error details
        return res.status(500).send(`Internal Server Error: ${error.message}`);
    }
};
