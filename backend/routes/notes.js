const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Note");
const { body, validationResult } = require("express-validator");


//Route 1 :Get All the notes from database: get "/api/notes/getuser" Login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server error");
  }
});

//Route 2 : Add the notes in database: post "/api/notes/addnote" Login Required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a Valid title").isLength({ min: 3 }),
    body("description", "Enter a description of atleast 7 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors, it returns the bad request and the error message given
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

//Route 3 : Update the existing notes in database: put "/api/notes/updateNotes" Login Required
router.put("/updateNotes/:id", fetchUser, async (req, res) => {
    try {    
  const { title, description, tag } = req.body;

  //create new notes 
    const newNote = {}
    if(title){newNote.title = title}
    if(description){newNote.description = description}
    if(tag){newNote.tag = tag}

    //Find the note to be updated and update it
    let note =await Notes.findById(req.params.id)

    if(!note){return res.status(404).send("Not Found")}
  
    //Allow updation only if user own the notes

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true})
    res.json({note})
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server error");
    }

});

//Route 4 : Delete the existing notes in database: delete "/api/notes/deleteNotes" Login Required
router.delete("/deleteNotes/:id", fetchUser, async (req, res) => {
    try {

    //Find the note to be deleted and delete it
    let note =await Notes.findById(req.params.id)

    if(!note){return res.status(404).send("Not Found")}

    //Allow deletion only if user own the notes

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({"Sucess":"Note has been Deleted", note:note})
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server error");
}

});

module.exports = router;
