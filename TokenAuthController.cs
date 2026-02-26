using Abp;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.AspNetZeroCore.Web.Authentication.External;
using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Configuration;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.MultiTenancy;
using Abp.Net.Mail;
using Abp.Notifications;
using Abp.Runtime.Caching;
using Abp.Runtime.Security;
using Abp.Runtime.Session;
using Abp.Timing;
using Abp.UI;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SEB.FPE.Authentication.TwoFactor.Google;
using SEB.FPE.Authorization;
using SEB.FPE.Authorization.Accounts.Dto;
using SEB.FPE.Authorization.Delegation;
using SEB.FPE.Authorization.Impersonation;
using SEB.FPE.Authorization.Roles;
using SEB.FPE.Authorization.Users;
using SEB.FPE.CommonMethods;
using SEB.FPE.Communications;
using SEB.FPE.Configuration;
using SEB.FPE.Exports;
using SEB.FPE.Identity;
using SEB.FPE.LookUps;
using SEB.FPE.Members;
using SEB.FPE.MultiTenancy;
using SEB.FPE.Net.Sms;
using SEB.FPE.Notifications;
using SEB.FPE.Security.Recaptcha;
using SEB.FPE.Web.Authentication.External;
using SEB.FPE.Web.Authentication.JwtBearer;
using SEB.FPE.Web.Authentication.TwoFactor;
using SEB.FPE.Web.Common;
using SEB.FPE.Web.Models.TokenAuth;
using SEB.FPE.Web.Security;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SEB.FPE.Web.Controllers
{
    [Route("api/[controller]/[action]")]
    public class TokenAuthController : FPEControllerBase
    {
        private const string UserIdentifierClaimType = "http://aspnetzero.com/claims/useridentifier";

        private readonly LogInManager _logInManager;
        private readonly ITenantCache _tenantCache;
        private readonly AbpLoginResultTypeHelper _abpLoginResultTypeHelper;
        private readonly TokenAuthConfiguration _configuration;
        private readonly UserManager _userManager;
        private readonly ICacheManager _cacheManager;
        private readonly IOptions<JwtBearerOptions> _jwtOptions;
        private readonly IExternalAuthConfiguration _externalAuthConfiguration;
        private readonly IExternalAuthManager _externalAuthManager;
        private readonly UserRegistrationManager _userRegistrationManager;
        private readonly IImpersonationManager _impersonationManager;
        private readonly IUserLinkManager _userLinkManager;
        private readonly IAppNotifier _appNotifier;
        private readonly ISmsSender _smsSender;
        private readonly IEmailSender _emailSender;
        private readonly IdentityOptions _identityOptions;
        private readonly GoogleAuthenticatorProvider _googleAuthenticatorProvider;
        private readonly ExternalLoginInfoManagerFactory _externalLoginInfoManagerFactory;
        private readonly ISettingManager _settingManager;
        private readonly IJwtSecurityStampHandler _securityStampHandler;
        private readonly AbpUserClaimsPrincipalFactory<User, Role> _claimsPrincipalFactory;
        public IRecaptchaValidator RecaptchaValidator { get; set; }
        private readonly IUserDelegationManager _userDelegationManager;
        private readonly IRepository<Role> _roleRepository;
        private readonly IMemberManager _MemberManager;
        private readonly IRepository<VwMemberUserDetail> _vwMemberUserDetail;
        private readonly IRepository<MemberBenefitCharacteristic> _memberBenefitCharacteristic;
        private readonly IRepository<StatusBasedMemberPortalAccess> _statusBasedMemberPortalAccess;
        private readonly IRepository<LookUp> _lookUp;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Member> _member;
        private readonly IUserEmailer _userEmailer;
        private readonly CommunicationManager _communicationManager;
        private readonly ICarrierExportManager _carrierExpMngr;
        private const string TwoFactorLoginRememberDays = "Abp.UserManagement.TwoFactorLogin.RememberDays";
        public TokenAuthController(
            LogInManager logInManager,
            ITenantCache tenantCache,
            AbpLoginResultTypeHelper abpLoginResultTypeHelper,
            TokenAuthConfiguration configuration,
            UserManager userManager,
            ICacheManager cacheManager,
            IOptions<JwtBearerOptions> jwtOptions,
            IExternalAuthConfiguration externalAuthConfiguration,
            IExternalAuthManager externalAuthManager,
            UserRegistrationManager userRegistrationManager,
            IImpersonationManager impersonationManager,
            IUserLinkManager userLinkManager,
            IAppNotifier appNotifier,
            ISmsSender smsSender,
            IEmailSender emailSender,
            IOptions<IdentityOptions> identityOptions,
            GoogleAuthenticatorProvider googleAuthenticatorProvider,
            ExternalLoginInfoManagerFactory externalLoginInfoManagerFactory,
            ISettingManager settingManager,
            IJwtSecurityStampHandler securityStampHandler,
            AbpUserClaimsPrincipalFactory<User, Role> claimsPrincipalFactory,
            IUserDelegationManager userDelegationManager,
            IRepository<Role> roleRepository,
            IMemberManager memberManager,
            IRepository<VwMemberUserDetail> vwMemberUserDetail,
            IRepository<MemberBenefitCharacteristic> memberBenefitCharacteristic,
            IRepository<StatusBasedMemberPortalAccess> statusBasedMemberPortalAccess,
            IRepository<LookUp> LookUp,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<Member> member,
            IUserEmailer userEmailer,
            CommunicationManager communicationManager,
            ICarrierExportManager carrierExpMngr
            )

        {
            _logInManager = logInManager;
            _tenantCache = tenantCache;
            _abpLoginResultTypeHelper = abpLoginResultTypeHelper;
            _configuration = configuration;
            _userManager = userManager;
            _cacheManager = cacheManager;
            _jwtOptions = jwtOptions;
            _externalAuthConfiguration = externalAuthConfiguration;
            _externalAuthManager = externalAuthManager;
            _userRegistrationManager = userRegistrationManager;
            _impersonationManager = impersonationManager;
            _userLinkManager = userLinkManager;
            _appNotifier = appNotifier;
            _smsSender = smsSender;
            _emailSender = emailSender;
            _googleAuthenticatorProvider = googleAuthenticatorProvider;
            _externalLoginInfoManagerFactory = externalLoginInfoManagerFactory;
            _settingManager = settingManager;
            _securityStampHandler = securityStampHandler;
            _identityOptions = identityOptions.Value;
            _claimsPrincipalFactory = claimsPrincipalFactory;
            RecaptchaValidator = NullRecaptchaValidator.Instance;
            _userDelegationManager = userDelegationManager;
            _roleRepository = roleRepository;
            _MemberManager = memberManager;
            _vwMemberUserDetail = vwMemberUserDetail;
            _memberBenefitCharacteristic = memberBenefitCharacteristic;
            _statusBasedMemberPortalAccess = statusBasedMemberPortalAccess;
            _lookUp = LookUp;
            _unitOfWorkManager = unitOfWorkManager;
            _member = member;
            _userEmailer = userEmailer;
            _communicationManager = communicationManager;
            _carrierExpMngr = carrierExpMngr;
        }

        [HttpPost]
        public async Task<AuthenticateResultModel> Authenticate([FromBody] AuthenticateModel model)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model));
            }

            if (UseCaptchaOnLogin())
            {
                await ValidateReCaptcha(model.CaptchaResponse);
            }

            // Validate input parameters
            if (string.IsNullOrWhiteSpace(model.UserNameOrEmailAddress) || string.IsNullOrWhiteSpace(model.Password))
            {
                Logger.Warn("Authentication attempt with empty username or password");
                throw new AbpAuthorizationException("Invalid user name or password");
            }

            string strUserName = AESEncryptDecrypt.DecryptStringAES(model.UserNameOrEmailAddress);
            string strPassword = AESEncryptDecrypt.DecryptStringAES(model.Password);
            var twoFactorRememberDays = 0;
            //AESEncrytDecry.DecryptStringAES(parameters.Get("clientID"));

            // Validate decryption was successful
            if (string.IsNullOrWhiteSpace(strUserName) || string.IsNullOrWhiteSpace(strPassword))
            {
                Logger.Warn($"Failed to decrypt credentials. Username empty: {string.IsNullOrWhiteSpace(strUserName)}, Password empty: {string.IsNullOrWhiteSpace(strPassword)}");
                throw new AbpAuthorizationException("Invalid user name or password");
            }

            var loginResult = await GetLoginResultAsync(
                //model.UserNameOrEmailAddress,
                //model.Password,
                strUserName,
                strPassword,
                GetTenancyNameOrNull()
            );

            // login validation
            var user = await _userManager.GetUserByIdAsync(loginResult.User.Id);

            var currentUserRoleList = from ur in await _userManager.GetRolesAsync(user)
                                      join r in _roleRepository.GetAll().AsNoTracking() on ur equals r.Name
                                      select r.DisplayName;
            // var IsAssigned = false;
            var returnUrl = model.ReturnUrl;

            string MemberAccessLevel = null;
            bool IsMember = false;
            bool IsUserRestrictLoginAccess = await _impersonationManager.IsloginAccessRestricted(loginResult.User.Id);
            var loginRestrictEnableSettingValue = await _carrierExpMngr.GetTenantSetting(Convert.ToInt32(loginResult.Tenant.Id), LookupSubType.IsLoginRestrictEnable);
            foreach (var item in currentUserRoleList.ToList())
            {
                if (item.ToUpper() == "MEMBER")
                    IsMember = true;
            }

            if (IsMember)
            {
                int MemberId = _MemberManager.GetMemberId(Convert.ToInt32(loginResult.User.Id));
                MemberAccessLevel = await _MemberManager.GetMemberWorkStatus(Convert.ToInt32(loginResult.User.TenantId), MemberId);
                if ((StatusBasedRestriction(MemberId, "RestrictAccessMember")) == 0)
                {
                    throw _abpLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(loginResult.Result, "StatusBasedRestriction", "");
                }
                string IsLoginAllowedForSSOTenant = await _MemberManager.CheckforLoginAllowedforSSOClient(Convert.ToInt32(loginResult.User.TenantId));
                if (IsLoginAllowedForSSOTenant == "NO")
                {
                    throw _abpLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(loginResult.Result, "StatusBasedRestriction", "");
                }

            }
            if(IsUserRestrictLoginAccess) 
            {
               throw _abpLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(loginResult.Result, "StatusBasedRestriction", "");
            }

            //if (model.Roletype == 2)
            //{
            //    IsAssigned = await _userManager.IsInRoleAsync(user, "1186b064665f40e7921f13544517b6a8");
            //}
            //else
            //{
            //    var checkStatus = await _userManager.IsInRoleAsync(user, "1186b064665f40e7921f13544517b6a8");
            //    if (!checkStatus)
            //        IsAssigned = true;
            //}
            if (model.SingleSignIn.HasValue && model.SingleSignIn.Value && loginResult.Result == AbpLoginResultType.Success)
            {
                loginResult.User.SetSignInToken();
                returnUrl = AddSingleSignInParametersToReturnUrl(model.ReturnUrl, loginResult.User.SignInToken, loginResult.User.Id, loginResult.User.TenantId);
            }

            //Password reset
            if (loginResult.User.ShouldChangePasswordOnNextLogin)
            {
                loginResult.User.SetNewPasswordResetCode();
                return new AuthenticateResultModel
                {
                    ShouldResetPassword = true,
                    PasswordResetCode = loginResult.User.PasswordResetCode,
                    UserId = loginResult.User.Id,
                    ReturnUrl = returnUrl
                };
            }

            //Two factor auth
            await _userManager.InitializeOptionsAsync(loginResult.Tenant?.Id);


            string twoFactorRememberClientToken = null;
            if (await IsTwoFactorAuthRequiredAsync(loginResult, model))
            {
                twoFactorRememberDays = SettingManager.GetSettingValue<int>(TwoFactorLoginRememberDays);
             
                if (model.TwoFactorVerificationCode.IsNullOrEmpty())
                {
                    //Add a cache item which will be checked in SendTwoFactorAuthCode to prevent sending unwanted two factor code to users.
                    _cacheManager
                        .GetTwoFactorCodeCache()
                        .Set(
                            loginResult.User.ToUserIdentifier().ToString(),
                            new TwoFactorCodeCacheItem()
                        );

                    return new AuthenticateResultModel
                    {
                        RequiresTwoFactorVerification = true,
                        UserId = loginResult.User.Id,
                        TwoFactorAuthProviders = await _userManager.GetValidTwoFactorProvidersAsync(loginResult.User),
                        ReturnUrl = returnUrl,
                        success = 1,
                        EmailAddress = user.EmailAddress,
                        PhoneNumber = user.PhoneNumber,
                        UserRoleList = currentUserRoleList.ToList(),
                        MemberAccess = MemberAccessLevel
                    };
                }

                twoFactorRememberClientToken = await TwoFactorAuthenticateAsync(loginResult.User, model);
            }

            // One Concurrent Login 
            if (AllowOneConcurrentLoginPerUser())
            {
                await _userManager.UpdateSecurityStampAsync(loginResult.User);
                await _securityStampHandler.SetSecurityStampCacheItem(loginResult.User.TenantId, loginResult.User.Id, loginResult.User.SecurityStamp);
                loginResult.Identity.ReplaceClaim(new Claim(AppConsts.SecurityStampKey, loginResult.User.SecurityStamp));
            }

            var accessToken = CreateAccessToken(await CreateJwtClaims(loginResult.Identity, loginResult.User));
            var refreshToken = CreateRefreshToken(await CreateJwtClaims(loginResult.Identity, loginResult.User, tokenType: TokenType.RefreshToken));

            return new AuthenticateResultModel
            {
                AccessToken = accessToken,
                ExpireInSeconds = (int)_configuration.AccessTokenExpiration.TotalSeconds,
                RefreshToken = refreshToken,
                RefreshTokenExpireInSeconds = (int)_configuration.RefreshTokenExpiration.TotalSeconds,
                EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                TwoFactorRememberClientToken = twoFactorRememberClientToken,
                UserId = loginResult.User.Id,
                ReturnUrl = returnUrl,
                // success = IsAssigned == true ? 1 : 0 // login validation,
                success = 1, // login validation
                UserRoleList = currentUserRoleList.ToList(),
                MemberAccess = MemberAccessLevel,
                TwoFactorRememberDays = twoFactorRememberDays
            };
        }

        [HttpPost]
        public async Task<RefreshTokenResult> RefreshToken(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new ArgumentNullException(nameof(refreshToken));
            }

            if (!IsRefreshTokenValid(refreshToken, out var principal))
            {
                throw new ValidationException("Refresh token is not valid!");
            }

            try
            {
                var user = _userManager.GetUser(UserIdentifier.Parse(principal.Claims.First(x => x.Type == AppConsts.UserIdentifier).Value));
                if (user == null)
                {
                    throw new UserFriendlyException("Unknown user or user identifier");
                }

                principal = await _claimsPrincipalFactory.CreateAsync(user);

                var accessToken = CreateAccessToken(await CreateJwtClaims(principal.Identity as ClaimsIdentity, user));

                return await Task.FromResult(new RefreshTokenResult(accessToken, GetEncryptedAccessToken(accessToken), (int)_configuration.AccessTokenExpiration.TotalSeconds));
            }
            catch (UserFriendlyException)
            {
                throw;
            }
            catch (Exception e)
            {
                throw new ValidationException("Refresh token is not valid!", e);
            }
        }

        private bool UseCaptchaOnLogin()
        {
            return SettingManager.GetSettingValue<bool>(AppSettings.UserManagement.UseCaptchaOnLogin);
        }


        [HttpGet]
        [AbpAuthorize]
        public async Task LogOut()
        {
            if (AbpSession.UserId != null)
            {
                var tokenValidityKeyInClaims = User.Claims.First(c => c.Type == AppConsts.TokenValidityKey);
                await _userManager.RemoveTokenValidityKeyAsync(_userManager.GetUser(AbpSession.ToUserIdentifier()), tokenValidityKeyInClaims.Value);
                _cacheManager.GetCache(AppConsts.TokenValidityKey).Remove(tokenValidityKeyInClaims.Value);

                if (AllowOneConcurrentLoginPerUser())
                {
                    await _securityStampHandler.RemoveSecurityStampCacheItem(AbpSession.TenantId, AbpSession.GetUserId());
                }
            }
        }

        [HttpPost]
        public async Task SendTwoFactorAuthCode([FromBody] SendTwoFactorAuthCodeModel model)
        {
            var cacheKey = new UserIdentifier(AbpSession.TenantId, model.UserId).ToString();

            var cacheItem = await _cacheManager
                .GetTwoFactorCodeCache()
                .GetOrDefaultAsync(cacheKey);

            if (cacheItem == null)
            {
                //There should be a cache item added in Authenticate method! This check is needed to prevent sending unwanted two factor code to users.
                throw new UserFriendlyException(L("SendSecurityCodeErrorMessage"));
            }
            //var user1 = await UserManager.FindByEmailAsync(inputEmailAddress);

            var user = await _userManager.FindByIdAsync(model.UserId.ToString());

            if (model.Provider != GoogleAuthenticatorProvider.Name)
            {
                cacheItem.Code = await _userManager.GenerateTwoFactorTokenAsync(user, model.Provider);                
                var message = L("EmailSecurityCodeBody", cacheItem.Code);
                if (model.Provider == "Email")
                {
                    //await _userEmailer.SendLoginOTPforMFAAsync( user,Convert.ToInt32(cacheItem.Code));
                    var communicationParam = new CommunicationParam
                    {
                        TenantId = (int)AbpSession.TenantId,
                        UserId = (int)user.Id,
                        EventName = EventCodes.MFAEmailTemplate,
                        EmailTypeName = LookupSubType.EmailRegisterType_MFAEmail,
                        //Mfa_otp = Convert.ToInt32(cacheItem.Code)
                        Mfa_otp = cacheItem.Code
                    };

                    await _communicationManager.SendNotificationConsolidated(communicationParam);
                }
                else if (model.Provider == "Phone")
                {
                    await _smsSender.SendAsync(await _userManager.GetPhoneNumberAsync(user), message);
                }
            }

            _cacheManager.GetTwoFactorCodeCache().Set(
                    cacheKey,
                    cacheItem
                );
            _cacheManager.GetCache("ProviderCache").Set(
                "Provider",
                model.Provider
            );
        }

        [HttpPost]
        public async Task<ImpersonatedAuthenticateResultModel> ImpersonatedAuthenticate(string impersonationToken)
        {
            var result = await _impersonationManager.GetImpersonatedUserAndIdentity(impersonationToken);
            var accessToken = CreateAccessToken(await CreateJwtClaims(result.Identity, result.User));

            return new ImpersonatedAuthenticateResultModel
            {
                AccessToken = accessToken,
                EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                ExpireInSeconds = (int)_configuration.AccessTokenExpiration.TotalSeconds
            };
        }

        [HttpPost]
        public async Task<ImpersonatedAuthenticateResultModel> DelegatedImpersonatedAuthenticate(long userDelegationId, string impersonationToken)
        {
            var result = await _impersonationManager.GetImpersonatedUserAndIdentity(impersonationToken);
            var userDelegation = await _userDelegationManager.GetAsync(userDelegationId);

            if (!userDelegation.IsCreatedByUser(result.User.Id))
            {
                throw new UserFriendlyException("User delegation error...");
            }

            var expiration = userDelegation.EndTime.Subtract(Clock.Now);
            var accessToken = CreateAccessToken(await CreateJwtClaims(result.Identity, result.User, expiration), expiration);

            return new ImpersonatedAuthenticateResultModel
            {
                AccessToken = accessToken,
                EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                ExpireInSeconds = (int)expiration.TotalSeconds
            };
        }

        [HttpPost]
        public async Task<SwitchedAccountAuthenticateResultModel> LinkedAccountAuthenticate(string switchAccountToken)
        {
            var result = await _userLinkManager.GetSwitchedUserAndIdentity(switchAccountToken);
            var accessToken = CreateAccessToken(await CreateJwtClaims(result.Identity, result.User));

            return new SwitchedAccountAuthenticateResultModel
            {
                AccessToken = accessToken,
                EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                ExpireInSeconds = (int)_configuration.AccessTokenExpiration.TotalSeconds
            };
        }

        [HttpGet]
        public List<ExternalLoginProviderInfoModel> GetExternalAuthenticationProviders()
        {
            var allProviders = _externalAuthConfiguration.ExternalLoginInfoProviders
                .Select(infoProvider => infoProvider.GetExternalLoginInfo()).ToList();
            return ObjectMapper.Map<List<ExternalLoginProviderInfoModel>>(allProviders);
        }

        [HttpPost]
        public async Task<ExternalAuthenticateResultModel> ExternalAuthenticate([FromBody] ExternalAuthenticateModel model)
        {
            var externalUser = await GetExternalUserInfo(model);

            var loginResult = await _logInManager.LoginAsync(new UserLoginInfo(model.AuthProvider, model.ProviderKey, model.AuthProvider), GetTenancyNameOrNull());

            switch (loginResult.Result)
            {
                case AbpLoginResultType.Success:
                    {
                        var accessToken = CreateAccessToken(await CreateJwtClaims(loginResult.Identity, loginResult.User));
                        var refreshToken = CreateRefreshToken(await CreateJwtClaims(loginResult.Identity, loginResult.User, tokenType: TokenType.RefreshToken));

                        var returnUrl = model.ReturnUrl;

                        if (model.SingleSignIn.HasValue && model.SingleSignIn.Value && loginResult.Result == AbpLoginResultType.Success)
                        {
                            loginResult.User.SetSignInToken();
                            returnUrl = AddSingleSignInParametersToReturnUrl(model.ReturnUrl, loginResult.User.SignInToken, loginResult.User.Id, loginResult.User.TenantId);
                        }

                        return new ExternalAuthenticateResultModel
                        {
                            AccessToken = accessToken,
                            EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                            ExpireInSeconds = (int)_configuration.AccessTokenExpiration.TotalSeconds,
                            ReturnUrl = returnUrl,
                            RefreshToken = refreshToken,
                            RefreshTokenExpireInSeconds = (int)_configuration.RefreshTokenExpiration.TotalSeconds
                        };
                    }
                case AbpLoginResultType.UnknownExternalLogin:
                    {
                        var newUser = await RegisterExternalUserAsync(externalUser);
                        if (!newUser.IsActive)
                        {
                            return new ExternalAuthenticateResultModel
                            {
                                WaitingForActivation = true
                            };
                        }

                        //Try to login again with newly registered user!
                        loginResult = await _logInManager.LoginAsync(new UserLoginInfo(model.AuthProvider, model.ProviderKey, model.AuthProvider), GetTenancyNameOrNull());
                        if (loginResult.Result != AbpLoginResultType.Success)
                        {
                            throw _abpLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(
                                loginResult.Result,
                                model.ProviderKey,
                                GetTenancyNameOrNull()
                            );
                        }

                        var accessToken = CreateAccessToken(await CreateJwtClaims(loginResult.Identity, loginResult.User));
                        var refreshToken = CreateRefreshToken(await CreateJwtClaims(loginResult.Identity, loginResult.User, tokenType: TokenType.RefreshToken));

                        return new ExternalAuthenticateResultModel
                        {
                            AccessToken = accessToken,
                            EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                            ExpireInSeconds = (int)_configuration.AccessTokenExpiration.TotalSeconds,
                            RefreshToken = refreshToken,
                            RefreshTokenExpireInSeconds = (int)_configuration.RefreshTokenExpiration.TotalSeconds
                        };
                    }
                default:
                    {
                        throw _abpLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(
                            loginResult.Result,
                            model.ProviderKey,
                            GetTenancyNameOrNull()
                        );
                    }
            }
        }

        #region Etc

        [AbpMvcAuthorize]
        [HttpGet]
        public async Task<ActionResult> TestNotification(string message = "", string severity = "info")
        {
            if (message.IsNullOrEmpty())
            {
                message = "This is a test notification, created at " + Clock.Now;
            }

            await _appNotifier.SendMessageAsync(
                AbpSession.ToUserIdentifier(),
                message,
                severity.ToPascalCase().ToEnum<NotificationSeverity>()
                );

            return Content("Sent notification: " + message);
        }

        #endregion

        private async Task<User> RegisterExternalUserAsync(ExternalAuthUserInfo externalLoginInfo)
        {
            string username;

            using (var providerManager = _externalLoginInfoManagerFactory.GetExternalLoginInfoManager(externalLoginInfo.Provider))
            {
                username = providerManager.Object.GetUserNameFromExternalAuthUserInfo(externalLoginInfo);
            }

            var user = await _userRegistrationManager.RegisterAsync(
                externalLoginInfo.Name,
                externalLoginInfo.Surname,
                externalLoginInfo.EmailAddress,
                username,
                await _userManager.CreateRandomPassword(),
                true,
                null
            );

            user.Logins = new List<UserLogin>
            {
                new UserLogin
                {
                    LoginProvider = externalLoginInfo.Provider,
                    ProviderKey = externalLoginInfo.ProviderKey,
                    TenantId = user.TenantId
                }
            };

            await CurrentUnitOfWork.SaveChangesAsync();

            return user;
        }

        private async Task<ExternalAuthUserInfo> GetExternalUserInfo(ExternalAuthenticateModel model)
        {
            var userInfo = await _externalAuthManager.GetUserInfo(model.AuthProvider, model.ProviderAccessCode);
            if (userInfo.ProviderKey != model.ProviderKey)
            {
                throw new UserFriendlyException(L("CouldNotValidateExternalUser"));
            }

            return userInfo;
        }

        private async Task<bool> IsTwoFactorAuthRequiredAsync(AbpLoginResult<Tenant, User> loginResult, AuthenticateModel authenticateModel)
        {
            if (!await SettingManager.GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsEnabled))
            {
                return false;
            }

            if (!loginResult.User.IsTwoFactorEnabled)
            {
                return false;
            }

            if ((await _userManager.GetValidTwoFactorProvidersAsync(loginResult.User)).Count <= 0)
            {
                return false;
            }

            if (await TwoFactorClientRememberedAsync(loginResult.User.ToUserIdentifier(), authenticateModel))
            {
                return false;
            }

            return true;
        }

        private async Task<bool> TwoFactorClientRememberedAsync(UserIdentifier userIdentifier, AuthenticateModel authenticateModel)
        {
            if (!await SettingManager.GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsRememberBrowserEnabled))
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(authenticateModel.TwoFactorRememberClientToken))
            {
                return false;
            }

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidAudience = _configuration.Audience,
                    ValidIssuer = _configuration.Issuer,
                    IssuerSigningKey = _configuration.SecurityKey,

                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                foreach (var validator in _jwtOptions.Value.SecurityTokenValidators)
                {
                    if (validator.CanReadToken(authenticateModel.TwoFactorRememberClientToken))
                    {
                        try
                        {
                            var principal = validator.ValidateToken(authenticateModel.TwoFactorRememberClientToken, validationParameters, out _);
                            var useridentifierClaim = principal.FindFirst(c => c.Type == UserIdentifierClaimType);
                            if (useridentifierClaim == null)
                            {
                                return false;
                            }

                            return useridentifierClaim.Value == userIdentifier.ToString();
                        }
                        catch (SecurityTokenExpiredException)
                        {
                            return false; //expired
                        }
                        catch (Exception ex)
                        {
                            Logger.Debug(ex.ToString(), ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Debug(ex.ToString(), ex);
            }

            return false;
        }

        /* Checkes two factor code and returns a token to remember the client (browser) if needed */
        private async Task<string> TwoFactorAuthenticateAsync(User user, AuthenticateModel authenticateModel)
        {
            var twoFactorCodeCache = _cacheManager.GetTwoFactorCodeCache();
            var userIdentifier = user.ToUserIdentifier().ToString();
            var cachedCode = await twoFactorCodeCache.GetOrDefaultAsync(userIdentifier);
            var provider = _cacheManager.GetCache("ProviderCache").Get("Provider", cache => cache).ToString();

            if (provider == GoogleAuthenticatorProvider.Name)
            {
                if (!await _googleAuthenticatorProvider.ValidateAsync("TwoFactor", authenticateModel.TwoFactorVerificationCode, _userManager, user))
                {
                    throw new UserFriendlyException(L("InvalidSecurityCode"));
                }
            }
            else if (cachedCode?.Code == null || cachedCode.Code != authenticateModel.TwoFactorVerificationCode)
            {
                throw new UserFriendlyException(L("InvalidSecurityCode"));
            }

            //Delete from the cache since it was a single usage code
            await twoFactorCodeCache.RemoveAsync(userIdentifier);

            if (authenticateModel.RememberClient)
            {
                if (await SettingManager.GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsRememberBrowserEnabled))
                {
                    return CreateAccessToken(new[]
                        {
                            new Claim(UserIdentifierClaimType, user.ToUserIdentifier().ToString())
                        },
                        TimeSpan.FromDays(365)
                    );
                }
            }

            return null;
        }

        private string GetTenancyNameOrNull()
        {
            if (!AbpSession.TenantId.HasValue)
            {
                return null;
            }

            return _tenantCache.GetOrNull(AbpSession.TenantId.Value)?.TenancyName;
        }

        private async Task<AbpLoginResult<Tenant, User>> GetLoginResultAsync(string usernameOrEmailAddress, string password, string tenancyName)
        {

            // var User = await _userManager.GetTenantId(usernameOrEmailAddress);          
            var loginResult = await _logInManager.LoginAsync(usernameOrEmailAddress, password, tenancyName);
            switch (loginResult.Result)
            {
                case AbpLoginResultType.Success:
                    return loginResult;
                default:
                    throw _abpLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(loginResult.Result, usernameOrEmailAddress, tenancyName);
            }
        }

        private string CreateAccessToken(IEnumerable<Claim> claims, TimeSpan? expiration = null)
        {
            return CreateToken(claims, expiration ?? _configuration.AccessTokenExpiration);
        }

        private string CreateRefreshToken(IEnumerable<Claim> claims)
        {
            return CreateToken(claims, AppConsts.RefreshTokenExpiration);
        }

        private string CreateToken(IEnumerable<Claim> claims, TimeSpan? expiration = null)
        {
            var now = DateTime.UtcNow;

            var jwtSecurityToken = new JwtSecurityToken(
                issuer: _configuration.Issuer,
                audience: _configuration.Audience,
                claims: claims,
                notBefore: now,
                signingCredentials: _configuration.SigningCredentials,
                expires: expiration == null ?
                    (DateTime?)null :
                    now.Add(expiration.Value)
            );

            return new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);
        }

        private static string GetEncryptedAccessToken(string accessToken)
        {
            return FpeEncryptDecrypt.Instance.Encrypt(accessToken, AppConsts.DefaultPassPhrase);
        }

        private async Task<IEnumerable<Claim>> CreateJwtClaims(ClaimsIdentity identity, User user, TimeSpan? expiration = null, TokenType tokenType = TokenType.AccessToken)
        {           
            var tokenValidityKey = Guid.NewGuid().ToString();
            var claims = identity.Claims.ToList();
            var nameIdClaim = claims.First(c => c.Type == _identityOptions.ClaimsIdentity.UserIdClaimType);

            if (_identityOptions.ClaimsIdentity.UserIdClaimType != JwtRegisteredClaimNames.Sub)
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Sub, nameIdClaim.Value));
            }

            claims.AddRange(new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.Now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim(AppConsts.TokenValidityKey, tokenValidityKey),
                new Claim(AppConsts.UserIdentifier, user.ToUserIdentifier().ToUserIdentifierString()),
                new Claim(AppConsts.TokenType, tokenType.To<int>().ToString())
             });

            if (!expiration.HasValue)
            {
                expiration = tokenType == TokenType.AccessToken
                    ? _configuration.AccessTokenExpiration
                    : _configuration.RefreshTokenExpiration;
            }

            _cacheManager
                .GetCache(AppConsts.TokenValidityKey)
                .Set(AppConsts.TokenValidityKey,tokenValidityKey,absoluteExpireTime: DateTimeOffset.Now.Add(expiration?? _configuration.AccessTokenExpiration));

            await _userManager.AddTokenValidityKeyAsync(
                user,
                tokenValidityKey,
                DateTime.UtcNow.Add(expiration.Value)
            );

            return claims;
        }

        private static string AddSingleSignInParametersToReturnUrl(string returnUrl, string signInToken, long userId, int? tenantId)
        {
            returnUrl += (returnUrl.Contains("?") ? "&" : "?") +
                         "accessToken=" + signInToken +
                         "&userId=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(userId.ToString()));
            if (tenantId.HasValue)
            {
                returnUrl += "&tenantId=" + Convert.ToBase64String(Encoding.UTF8.GetBytes(tenantId.Value.ToString()));
            }

            return returnUrl;
        }


        private bool IsRefreshTokenValid(string refreshToken, out ClaimsPrincipal principal)
        {
            principal = null;

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidAudience = _configuration.Audience,
                    ValidIssuer = _configuration.Issuer,
                    IssuerSigningKey = _configuration.SecurityKey,

                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                foreach (var validator in _jwtOptions.Value.SecurityTokenValidators)
                {
                    if (!validator.CanReadToken(refreshToken))
                    {
                        continue;
                    }

                    try
                    {
                        principal = validator.ValidateToken(refreshToken, validationParameters, out _);

                        if (principal.Claims.FirstOrDefault(x => x.Type == AppConsts.TokenType)?.Value == TokenType.RefreshToken.To<int>().ToString())
                        {
                            return true;
                        }
                    }
                    catch (SecurityTokenExpiredException)
                    {
                        return false; //expired
                    }
                    catch (Exception ex)
                    {
                        Logger.Debug(ex.ToString(), ex);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Debug(ex.ToString(), ex);
            }

            return false;
        }


        private bool AllowOneConcurrentLoginPerUser()
        {
            return _settingManager.GetSettingValue<bool>(AppSettings.UserManagement.AllowOneConcurrentLoginPerUser);
        }

        private async Task ValidateReCaptcha(string captchaResponse)
        {
            var requestUserAgent = Request.Headers["User-Agent"].ToString();
            if (!requestUserAgent.IsNullOrWhiteSpace() && WebConsts.ReCaptchaIgnoreWhiteList.Contains(requestUserAgent.Trim()))
            {
                return;
            }

            await RecaptchaValidator.ValidateAsync(captchaResponse);
        }
        [HttpPost]
        public int StatusBasedRestriction(int memberId, string type)
        {
            int isMemberAccess = 0;
            DateTime currentDate = DateTime.Today;

            var lookupData = _lookUp.GetAll().AsNoTracking().FirstOrDefault(x => x.InternalEntryName == MemberConsts.PlanMemberStatus);
            var status = _lookUp.GetAll().AsNoTracking().Where(x => x.ParentTableId == lookupData.Id).Select(x => x.Id).ToList();
            var memberData = _member.GetAll().AsNoTracking().FirstOrDefault(x => x.Id == memberId);

            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                var memberbenefitcharacteristic = _memberBenefitCharacteristic.GetAll().AsNoTracking().
                FirstOrDefault(e => e.MemberId == memberId && status.Contains(e.CharacteristicType)
                && (e.SinceDate <= currentDate)
                && (!e.EndDate.HasValue || e.EndDate.HasValue && e.EndDate >= currentDate));

                if (memberbenefitcharacteristic == null)
                {
                    memberbenefitcharacteristic = _memberBenefitCharacteristic.GetAll().AsNoTracking().
                    FirstOrDefault(e => e.MemberId == memberId && status.Contains(e.CharacteristicType)
                    && (e.SinceDate == memberData.BenefitEligibilityDate));
                }
                if (memberbenefitcharacteristic != null)
                {
                    var statusBasedMemberPortalAccess = _statusBasedMemberPortalAccess.GetAll().AsNoTracking().
                        FirstOrDefault(x => x.StatusId == memberbenefitcharacteristic.CharacteristicType);
                    if (type == "RestrictAccessEnrollment")
                    {
                        if (statusBasedMemberPortalAccess.RestrictEnrollmentAccess == false)
                        {
                            isMemberAccess = 1;//Access                       
                        }
                    }
                    else if (type == "RestrictAccessMember")
                    {
                        if (statusBasedMemberPortalAccess.RestrictAccessToMemberPortal == false)
                        {
                            isMemberAccess = 1;//Access                       
                        }
                        else
                        {
                            DateTime effectiveDate = memberbenefitcharacteristic.SinceDate.AddDays(statusBasedMemberPortalAccess.GracePeriod);
                            if (effectiveDate > DateTime.Today) // Removed "=" from this condition in order to restrict the member access on the day when the grace period is reached. For example, 01-April + 10 days means member can access onlyy till 10-April. On 11th April, member shall be restricted.
                            {
                                isMemberAccess = 1; //Access                           
                            }
                            else
                            {
                                isMemberAccess = 0;//Not Access
                            }
                        }
                    }
                }
                return isMemberAccess;
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task LogoutAnonymous()
        {
            //string callbackKey = Request.Headers.GetValues("Authorization").First();
            //string XAPiKey = CommonFunctions.GetXApiKey();
            //string callbackKey = Request.Headers["Authorization"].First();
            if (AbpSession.UserId != null)
            {
                var tokenValidityKeyInClaims = User.Claims.First(c => c.Type == AppConsts.TokenValidityKey);
                await _userManager.RemoveTokenValidityKeyAsync(_userManager.GetUser(AbpSession.ToUserIdentifier()), tokenValidityKeyInClaims.Value);
                _cacheManager.GetCache(AppConsts.TokenValidityKey).Remove(tokenValidityKeyInClaims.Value);

                if (AllowOneConcurrentLoginPerUser())
                {
                    await _securityStampHandler.RemoveSecurityStampCacheItem(AbpSession.TenantId, AbpSession.GetUserId());
                }
            }
        }

    }
}
