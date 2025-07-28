class SignatureMsg {
  static AUTHORIZATION = "AUTHORIZATION";
  static DELETE_LINK = "DELETE_LINK";
  static DELETE_FILE = "DELETE_FILE";
  static DOWNLOAD_FILE = "DOWNLOAD_FILE";
  static SIGN_CONTRACT = "SIGN_CONTRACT";

  static SIGNATURE_TTL: number = 120_000; // 2 minutes in ms
}

export default SignatureMsg;
