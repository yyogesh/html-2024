using OtpNet;
using SEB.FPE.Authorization.Users;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SEB.FPE.Web.Security
{
    public class AESEncryptDecrypt
    {

        //private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private static string KEY = "SEB0808080808FPE";
        private static string ISSUER = "SEB.FPE"; 
        private static string Secret { get;  set; }
        private static bool UseHttps { get; set; } = true;
        private static string TwoFactorCode { get; set; } = string.Empty; 
        public static string DecryptStringAES(string cipherText)
        {
            if (string.IsNullOrWhiteSpace(cipherText))
            {
                return string.Empty;
            }

            try
            {
                cipherText = cipherText.Replace(" ", "+");
                int mod4 = cipherText.Length % 4;
                if (mod4 > 0)
                {
                    cipherText += new string('=', 4 - mod4);
                }

                var keybytes = Encoding.UTF8.GetBytes(KEY);
                var iv = Encoding.UTF8.GetBytes(KEY);

                var encrypted = Convert.FromBase64String(cipherText);
                var decriptedFromJavascript = DecryptStringFromBytes(encrypted, keybytes, iv);
                
                // Check if decryption returned "keyError" which indicates decryption failure
                if (decriptedFromJavascript == "keyError")
                {
                    return string.Empty;
                }
                
                return string.Format(decriptedFromJavascript);
            }
            catch (FormatException ex)
            {
                // Invalid Base64 string
                //object ErrObj = "Error occur for Decrypting parameter: " + cipherText + " , Employee: NA, MethodName: DecryptStringAES";
                //Log.Error(ErrObj, ex);
                return string.Empty;
            }
            catch (CryptographicException ex)
            {
                // Decryption failed
                //object ErrObj = "Error occur for Decrypting parameter: " + cipherText + " , Employee: NA, MethodName: DecryptStringAES";
                //Log.Error(ErrObj, ex);
                return string.Empty;
            }
            catch (Exception ex)
            {
                //object ErrObj = "Error occur for Decrypting parameter: " + cipherText + " , Employee: NA, MethodName: DecryptStringAES";
                //Log.Error(ErrObj, ex);
                return string.Empty;
            }
        }
        public static byte[] EncryptStringAES(string plainText)
        {
            var keybytes = Encoding.UTF8.GetBytes(KEY);
            var iv = Encoding.UTF8.GetBytes(KEY);
            return EncryptStringToBytes(plainText, keybytes, iv);
        }
        private static string DecryptStringFromBytes(byte[] cipherText, byte[] key, byte[] iv)
        {
            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
            {
                throw new ArgumentNullException("cipherText");
            }
            if (key == null || key.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            if (iv == null || iv.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }

            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;

            // Create an RijndaelManaged object
            // with the specified key and IV.
            using (var rijAlg = new RijndaelManaged())
            {
                //Settings
                rijAlg.Mode = CipherMode.CBC;
                rijAlg.Padding = PaddingMode.PKCS7;
                rijAlg.FeedbackSize = 128;

                rijAlg.Key = key;
                rijAlg.IV = iv;

                // Create a decrytor to perform the stream transform.
                var decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);
                try
                {
                    // Create the streams used for decryption.
                    using (var msDecrypt = new MemoryStream(cipherText))
                    {
                        using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {

                            using (var srDecrypt = new StreamReader(csDecrypt))
                            {
                                // Read the decrypted bytes from the decrypting stream
                                // and place them in a string.
                                plaintext = srDecrypt.ReadToEnd();

                            }

                        }
                    }
                }
                catch (Exception ex)
                {
                    plaintext = "keyError";
                }
            }

            return plaintext;
        }

        private static byte[] EncryptStringToBytes(string plainText, byte[] key, byte[] iv)
        {
            // Check arguments.
            if (plainText == null || plainText.Length <= 0)
            {
                throw new ArgumentNullException("plainText");
            }
            if (key == null || key.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            if (iv == null || iv.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            byte[] encrypted;
            // Create a RijndaelManaged object
            // with the specified key and IV.
            using (var rijAlg = new RijndaelManaged())
            {
                rijAlg.Mode = CipherMode.CBC;
                rijAlg.Padding = PaddingMode.PKCS7;
                rijAlg.FeedbackSize = 128;

                rijAlg.Key = key;
                rijAlg.IV = iv;

                // Create a decrytor to perform the stream transform.
                var encryptor = rijAlg.CreateEncryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for encryption.
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (var swEncrypt = new StreamWriter(csEncrypt))
                        {
                            //Write all data to the stream.
                            swEncrypt.Write(plainText);
                        }
                        encrypted = msEncrypt.ToArray();
                    }
                }
            }

            // Return the encrypted bytes from the memory stream.
            return encrypted;
        }
        public static async Task<string> GenerateTwoFactorTokenAsync(User user)
        {
            if(!string.IsNullOrEmpty(TwoFactorCode) && VerifyCode(TwoFactorCode))
            {
                return TwoFactorCode;
            }
            string currentOtpCode =await GetCurrentOtpCode(user);
            TwoFactorCode=currentOtpCode;
            return currentOtpCode;
        }


        private static string UrlEncode(string value)
        {
            var stringBuilder = new StringBuilder();
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";

            foreach (var symbol in value)
            {
                if (validChars.IndexOf(symbol) != -1)
                {
                    stringBuilder.Append(symbol);
                }
                else
                {
                    stringBuilder.Append('%' + $"{(int)symbol:X2}");
                }
            }

            return stringBuilder.ToString().Replace(" ", "%20");
        }

        private static string EncodeAccountSecretKey(string accountSecretKey)
        {
            return Base32Encode(Encoding.UTF8.GetBytes(accountSecretKey));
        }

        private static string Base32Encode(byte[] data)
        {
            var inByteSize = 8;
            var outByteSize = 5;
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".ToCharArray();

            int i = 0, index = 0;
            var result = new StringBuilder((data.Length + 7) * inByteSize / outByteSize);

            while (i < data.Length)
            {
                var currentByte = data[i] >= 0 ? data[i] : (data[i] + 256);

                int digit;
                if (index > inByteSize - outByteSize)
                {
                    int nextByte;
                    if (i + 1 < data.Length)
                        nextByte = (data[i + 1] >= 0) ? data[i + 1] : (data[i + 1] + 256);
                    else
                        nextByte = 0;

                    digit = currentByte & (0xFF >> index);
                    index = (index + outByteSize) % inByteSize;
                    digit <<= index;
                    digit |= nextByte >> (inByteSize - index);
                    i++;
                }
                else
                {
                    digit = (currentByte >> (inByteSize - (index + outByteSize))) & 0x1F;
                    index = (index + outByteSize) % inByteSize;
                    if (index == 0)
                        i++;
                }
                result.Append(alphabet[digit]);
            }

            return result.ToString();
        }

        public static bool VerifyCode(string userCode)
        {
            var totp = new Totp(Base32Encoding.ToBytes(Secret), step: 60, totpSize: 6);
            return  totp.VerifyTotp(userCode, out long _, VerificationWindow.RfcSpecifiedNetworkDelay);
        }

        public static Task<string> GetCurrentOtpCode(User user)
        {
            //In case the code is length is less than 6 digit           
            var accountSecretKey = string.IsNullOrEmpty(user.GoogleAuthenticatorKey) ? Guid.NewGuid().ToString() :user.GoogleAuthenticatorKey;
            Secret = EncodeAccountSecretKey(accountSecretKey); // base32-encoded
            string accountTitleNoSpaces = Uri.EscapeDataString(user.EmailAddress);
            byte[] secretBytes = Encoding.UTF8.GetBytes(accountSecretKey);
            string encodedIssuer = Uri.EscapeDataString(ISSUER);
            accountTitleNoSpaces = accountTitleNoSpaces?.Replace(" ", "") ?? throw new NullReferenceException("Account Title is null");
            string provisionUrl = UrlEncode(string.IsNullOrEmpty(ISSUER) ?
                $"otpauth://totp/{accountTitleNoSpaces}?secret={Secret}&digits=6" :
                $"otpauth://totp/{accountTitleNoSpaces}?secret={Secret}&issuer={UrlEncode(encodedIssuer)}&digits=6");
            var protocol = UseHttps ? "https" : "http";
            var url =
                $"{protocol}://chart.googleapis.com/chart?cht=qr&chs={300}x{300}&chl={provisionUrl}";
            Totp totp = new Totp(secretBytes, step: 60, totpSize: 6); // Use 6 or 8 digits as needed     
            return Task.FromResult (totp.ComputeTotp());
        }
    }
}

