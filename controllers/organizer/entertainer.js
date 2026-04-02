import Entertainer from "../../models/entertainer.js";
//Getting all the agent in the employee dashboard

export const getAllEntertainer = async (req, res) => {
  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: "Token invalid " });
    }
    // finding all the entertainer with avaliable status and the isVerified
    const agent = await Entertainer.find({
      availabilityStatus: "available",
      isVerified: true,
    });
    return res.status(200).json({ message: "Success", entertainers: agent });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server error" });
  }
};

// Getting the entertainer profile
export const getEntertainerById = async (req, res) => {
  try {
    const { entertainerId } = req.params;
    // Finding the agent by their id
    const agent = await Entertainer.findById(entertainerId)
      .select("-password")
      .lean();
    if (!agent) {
      return res.status(404).json({ message: "Entertainer not found" });
    }
    // Success message
    return res.status(200).json({
      message: "Success",
      entertainer: agent,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server error " });
  }
};
