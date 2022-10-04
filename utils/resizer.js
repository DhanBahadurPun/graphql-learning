const sharp = require("sharp");
const uuidv4 = require("uuid/v4");
const path = require("path");

class Resize {
  constructor(folder) {
    this.folder = folder;
  }
  async save(buffer) {
    const filename = Resize.filename();
    const sizes = [
      { width: 800, height: 400, path: "large" },
      { width: 400, height: 300, path: "medium" }
    ];

    for (let s of sizes) {
      const filepath = this.filepath(filename, s.path);
      let w = parseInt(s.width);
      let h = parseInt(s.height);

      await sharp(buffer)
        .resize(w, h, {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFile(filepath);
    }
    return filename;
  }
  static filename() {
    return `${uuidv4()}.png`;
  }
  filepath(filename, size) {
    return path.resolve(`${this.folder}/${size}/${filename}`);
  }
}
module.exports = Resize;
