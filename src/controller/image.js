const image = (req, res) => {
    res.sendFile(__dirname + '/../public/images/' + req.filename);
}

module.exports = image;