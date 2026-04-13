import Bar from "../../models/bar.js";

// Getting profile
export const getProfile = async (req, res) => {
  try {
    const user_id = req.user.sub;
    //Hides password and return plain json format
    const agency = await Bar.findById(user_id).select("-password").lean();
    if (!agency) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      profile: agency,
      tokenUser: { userId: user_id, email: req.user.email },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server error" });
  }
};

//Updating a profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const update = req.body;
    // forbidden fields to be updated
    const forbidden = ["_id", "password"];
    forbidden.forEach((field) => delete update[field]);
    // Force update to isVerifed to the true
    update.isVerified = true;
    //Find by id and update
    const updatedAgency = await Bar.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!updatedAgency) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "Profile updated",
      profile: updatedAgency,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Testing the blob storage
export const updateProfileBlob = async (req, res) => {
  try {
    const userId = req.user.sub;

    const updateData = {
      businessName: req.body.businessName,
      ownerName: req.body.ownerName,
      phone: req.body.phone,
      address: req.body.address,
      description: req.body.description,
      venueType: req.body.venueType,
    };

    if (req.file) {
      updateData.profileImage = `/uploads/bars/${req.file.filename}`;
    }

    const updatedBar = await Bar.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBar) {
      return res.status(404).json({
        message: "Bar profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      bar: updatedBar,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};
