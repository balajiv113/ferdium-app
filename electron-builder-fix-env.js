exports.default = async function(context) {
  delete process.env.GYP_MSVS_VERSION
  console.log("========"+JSON.stringify(process.env)+"=============")
}
