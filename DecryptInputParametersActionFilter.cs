using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using SEB.FPE.Security;
using System.Dynamic;

namespace SEB.FPE.CustomFilters
{
    public class DecryptInputParametersActionFilter : ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // our code before action executes
            //AESEncryptDecrypt.DecryptStringAES(
            ///var param = context.ActionArguments.SingleOrDefault(p => p.Value is IEntity);


            //foreach (var argument in context.ActionArguments.Values.Where(v => v is T))
            //{
            //    T model = argument as T;
            //    // your logic
            //}

            var _requestHeaders = context.HttpContext.Request.Headers.ToList();
            var headers = context.HttpContext.Request.Headers;
            string MemberDecrypted = string.Empty;
            string OrganizationDecrypted = string.Empty;
            string PlansponserDecrypted = string.Empty;
            string PersonDecrypted = string.Empty;
            //string strMemberId ="0";
            //var re = context.HttpContext.Request;
            //var headers = re.Headers;


            // bool _memberId=  context.HttpContext.Request.Headers.TryGetValue("memberid", out var strMemberId);

            if (!String.IsNullOrEmpty(headers["memberid"]))
            {
                string tokenmemberid = headers["memberid"];
                MemberDecrypted = AESEncryptDecrypt.DecryptStringAES(tokenmemberid);
                // If decryption fails and returns empty, keep original value or use query string fallback
                if (string.IsNullOrEmpty(MemberDecrypted))
                {
                    MemberDecrypted = context.HttpContext.Request.Query["memberid"].ToString();
                }
            }
            else
            {
                MemberDecrypted = context.HttpContext.Request.Query["memberid"].ToString();
            }


            if (!String.IsNullOrEmpty(headers["organizationid"]))
            {
                string tokenorganizationid = headers["organizationid"];
                OrganizationDecrypted = AESEncryptDecrypt.DecryptStringAES(tokenorganizationid);
                // If decryption fails and returns empty, keep original value or use query string fallback
                if (string.IsNullOrEmpty(OrganizationDecrypted))
                {
                    OrganizationDecrypted = context.HttpContext.Request.Query["organizationid"].ToString();
                }
            }
            else
            {
                OrganizationDecrypted = context.HttpContext.Request.Query["organizationid"].ToString();
            }


            if (!String.IsNullOrEmpty(headers["plansponserid"]))
            {
                string tokenplansponserid = headers["plansponserid"];
                PlansponserDecrypted = AESEncryptDecrypt.DecryptStringAES(tokenplansponserid);
                // If decryption fails and returns empty, keep original value or use query string fallback
                if (string.IsNullOrEmpty(PlansponserDecrypted))
                {
                    PlansponserDecrypted = context.HttpContext.Request.Query["plansponserid"].ToString();
                }
            }
            else
            {
                PlansponserDecrypted = context.HttpContext.Request.Query["plansponserid"].ToString();
            }

            if (!String.IsNullOrEmpty(headers["personid"]))
            {
                string tokenpersonid = headers["personid"];
                PersonDecrypted = AESEncryptDecrypt.DecryptStringAES(tokenpersonid);
                // If decryption fails and returns empty, keep original value or use query string fallback
                if (string.IsNullOrEmpty(PersonDecrypted))
                {
                    PersonDecrypted = context.HttpContext.Request.Query["personid"].ToString();
                }
            }
            else
            {
                PersonDecrypted = context.HttpContext.Request.Query["personid"].ToString();
            }




            //if (_memberId)
            //    MemberDecrypted = AESEncryptDecrypt.DecryptStringAES(strMemberId);

            //var stringArgs = context.ActionArguments.Where(pair => pair.Value is string).ToList();

            //foreach (var keyValue in stringArgs)
            //{
            //    string safeValue = MemberDecrypted; //((string)keyValue.Value).Replace("\'", "");
            //    context.ActionArguments[keyValue.Key] = safeValue;
            //}



            var _params = context.ActionDescriptor.Parameters;


            foreach (var _itemArg in context.ActionArguments.ToList())
            {
                //object data = _itemArg.Value;
                //string strKey = _itemArg.Key;

                //Dictionary<string, string> _dictionary = data.GetType().GetProperties()
                //                                        .ToDictionary(x => x.Name, x => x.GetValue(data)?.ToString() ?? "");
                if (_itemArg.Key.ToLower() == "memberid")
                {
                    //_itemArg.Value = MemberDecrypted;
                    // var safeValue = ((string)_itemArg.Value).Replace(_itemArg.Value, MemberDecrypted);
                    var memberidType = _params.Where(x => x.Name.ToLower() == "memberid").FirstOrDefault().ParameterType;
                    if (!string.IsNullOrEmpty(MemberDecrypted) && MemberDecrypted!="0")
                    {
                        context.ActionArguments[_itemArg.Key] = ChangeType(MemberDecrypted, memberidType);
                    }

                    //_itemArg.Value = MemberDecrypted;

                    //context.HttpContext.Items.Add("entity", entity);

                    // context.ActionArguments.Add(strKey, entity);
                }

                if (_itemArg.Key.ToLower() == "organizationid")
                {

                    var organizationType = _params.Where(x => x.Name.ToLower() == "organizationid").FirstOrDefault().ParameterType;
                    if (OrganizationDecrypted=="undefined")
                    {
                        context.ActionArguments[_itemArg.Key] = 0;
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(OrganizationDecrypted) && OrganizationDecrypted != "0")
                        {
                            context.ActionArguments[_itemArg.Key] = ChangeType(OrganizationDecrypted, organizationType);
                        }
                            
                    }
                    
                }
                if (_itemArg.Key.ToLower() == "orgid")
                {
                    var orgType = _params.Where(x => x.Name.ToLower() == "orgid").FirstOrDefault().ParameterType;
                    if (!string.IsNullOrEmpty(OrganizationDecrypted) && OrganizationDecrypted != "0")
                    {
                        context.ActionArguments[_itemArg.Key] = ChangeType(OrganizationDecrypted, orgType);
                    }
                }
                if (_itemArg.Key.ToLower() == "plansponserid")
                {
                    var plansponserType = _params.Where(x => x.Name.ToLower() == "plansponserid").FirstOrDefault().ParameterType;
                    if (!string.IsNullOrEmpty(PlansponserDecrypted) && PlansponserDecrypted != "0")
                    {
                        context.ActionArguments[_itemArg.Key] = ChangeType(PlansponserDecrypted, plansponserType);
                    }
                       
                }
                if (_itemArg.Key.ToLower() == "personid")
                {
                    var personType = _params.Where(x => x.Name.ToLower() == "personid").FirstOrDefault().ParameterType;
                    if (!string.IsNullOrEmpty(PersonDecrypted) && PersonDecrypted != "0")
                    {
                        context.ActionArguments[_itemArg.Key] = ChangeType(PersonDecrypted, personType);
                    }  
                }
            }
            
            base.OnActionExecuting(context);
                //foreach (var itemDics in _dictionary)
                //{
                //    ///  itemDics.Value = AESEncryptDecrypt.DecryptStringAES(itemDics.Value);
                //}

                //var safeValue = ""; // AESEncryptDecrypt.DecryptStringAES(_itemArg.Value);
                // context.ActionArguments[_itemArg.Key] = safeValue;

                // KeyValuePair itemNew = new KeyValuePair();

                //_itemArg =  _itemArg AESEncryptDecrypt.DecryptStringAES(_itemArg.Value);

                //     foreach (KeyValuePair<string, string> SSOargument in SSOarguments)
                //{
                //    destinationQueryString += SSOargument.Key + "=" + SSOargument.Value + "&";
                //}
            }


            // base.OnActionExecuting(context);

        }

        public static object ChangeType(object value, Type conversion)
        {
            var t = conversion;

            if (t.IsGenericType && t.GetGenericTypeDefinition().Equals(typeof(Nullable<>)))
            {
                if (value == null)
                {
                    return null;
                }

                t = Nullable.GetUnderlyingType(t);
            }

            return Convert.ChangeType(value, t);
        }


        public override void OnActionExecuted(ActionExecutedContext context)
        {
            // our code after action executes
        }

        private static dynamic DictionaryToObject(IDictionary<String, Object> dictionary)
        {
            var expandoObj = new ExpandoObject();
            var expandoObjCollection = (ICollection<KeyValuePair<String, Object>>)expandoObj;

            foreach (var keyValuePair in dictionary)
            {
                expandoObjCollection.Add(keyValuePair);
            }
            dynamic eoDynamic = expandoObj;
            return eoDynamic;
        }

        //private string GetHeaderValue(this HttpRequest request, string key)
        //{
        //    //return request.Headers.FirstOrDefault(x => x.Key == key).Value.FirstOrDefault();
        //  return request.Headers.FirstOrDefault(x => x.Key == key).Value.FirstOrDefault();
        //}

        //public static dynamic GetAllHeaders(this HttpRequest Request, string key)
        //{
        //    Dictionary<string, string> requestHeaders =
        //       new Dictionary<string, string>();

        //    var expandoObjDictionary = (ICollection<KeyValuePair<String, Object>>)
        //   //return Request.Headers.FirstOrDefault(x => x.Key == key).Value.FirstOrDefault();

        //    foreach (var header in Request.Headers)
        //    {
        //        requestHeaders.Add(header.Key, header.Value);
        //    }
        //    return requestHeaders;
        //}

       

    }
}