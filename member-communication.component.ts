import { AfterViewInit, Component, ElementRef, EventEmitter, Injector, OnInit, Output, Renderer2, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { CustomvalidationService } from "@app/shared/common/custom-validation/customvalidation.service";
import { EntityFieldDetailModalComponent } from "@app/shared/common/entityHistory/field-type-history-model.component";
import { AppConsts } from "@shared/AppConsts";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { SessionStorageHelper } from "@shared/helpers/SessionStorage.helper";
import { CommonLookupServiceProxy, CreateOrEditMemberPersonDto, CreateOrEditMemberPersonListDto, CreateOrEditPersonAddressDto, CreateOrEditPersonDto, CreateOrEditPersonEmailDto, CreateOrEditPersonPhoneDto, MembersServiceProxy, OptionsetDto } from "@shared/service-proxies/service-proxies";
import { result } from "lodash";
import { combineLatest } from "rxjs/internal/observable/combineLatest";
import { debounceTime, finalize } from "rxjs/operators";


@Component({
    selector: 'member-communication',
    templateUrl: './member-communication.component.html',
    styleUrls: ['./member-communication.component.css'],
    animations: [appModuleAnimation()]
})


export class MemberCommunicationDetail extends AppComponentBase implements OnInit, AfterViewInit {

    contactDetailForm: FormGroup;
    memberPersonList: CreateOrEditMemberPersonListDto = new CreateOrEditMemberPersonListDto();
    submitted = false;
    prevAddressEffectiveDate = '';
    prevProvince: number;
    addressChangePromptCount: number;
    personId: number;
    personMemberLanguage: number;
    personFirstName: string;
    personMidName: string;
    personLastName: string;
    personGender: number;
    personBirthDate: string;
    person: CreateOrEditPersonDto = new CreateOrEditPersonDto();
    personAddress: CreateOrEditPersonAddressDto = new CreateOrEditPersonAddressDto();
    personAddressForWork: CreateOrEditPersonAddressDto = new CreateOrEditPersonAddressDto();
    personEmailAddress: CreateOrEditPersonEmailDto = new CreateOrEditPersonEmailDto();
    personPhone: CreateOrEditPersonPhoneDto = new CreateOrEditPersonPhoneDto();
    personAddressResidenceId: number;
    memberId: number;
    orgId: number;
    orgPlansonsorId: number;
    personPhoneTypeCell: number;
    personEmailPersonalId: number;
    personEmailTypePersonal: number;
    emailLookupItems: OptionsetDto[];
    memberUserId: number = 0;
    memberCallingParam = '';
    personAddressTypeResident: number;
    personPhoneCellId: number;
    personPhoneFormatTypeCell: number;
    personPhoneForWork: CreateOrEditPersonPhoneDto = new CreateOrEditPersonPhoneDto();
    personPhoneBusinessId: number;
    personPhoneTypeBusiness: number;
    allPhoneTypes: any; //OptionsetDto[];
    allAddressTypes: OptionsetDto[];
    allPhoneFormatTypes: OptionsetDto[];
    personPhoneFormatTypeBusiness: number;
    memberPerson: CreateOrEditMemberPersonDto = new CreateOrEditMemberPersonDto();
    saving: boolean;
    isCommunicationHistory = false;
    isDirty = false;
    showSpinner = false;
    historyEffectiveDate: string;
    communicationHistory: string[] = [];
    isPreferredPhoneAuditId: number;
    isCommunicationAttestationAuditId: number;
    isSpinner: boolean;
    isUsersExists: boolean = false;
    allStateProvinces: OptionsetDto[];
    hasEditAccess = false;
    isCommunicationInfoReadOnlyAccess = false;
    isCommunicationInfoEditAccess = false;
    MemberEmail = '';
    emailResponse = true;
    originalEmailId = '';
    @ViewChild('entityFieldDetailModal', { static: true }) fieldTypeHistoryModal: EntityFieldDetailModalComponent;
    personAddressEntity: string;
    personPhoneEntity: string;
    communicationAttestationEntity: string
    communicationAttestationOldValue: boolean;
    personEmailEntity: string;
    @Output() memberEmailChangeEvent: EventEmitter<any> = new EventEmitter();
    MultipleResultData: any;
    prevaddressStartdateDate: string;
    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private fb: FormBuilder,
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _membersServiceProxy: MembersServiceProxy,
        private _commonLookupServiceProxy: CommonLookupServiceProxy,
        private _customvalidationService: CustomvalidationService,
        private _sessionStorageHelper: SessionStorageHelper
    ) {
        super(injector);
        this._activatedRoute.queryParams.subscribe(p => {
            this.memberId = p.id;
            this.memberUserId = p.memberUserId;
            this.orgId = p.orgId;
            this.orgPlansonsorId = p.ps;
            this.memberCallingParam = p.callingParam;
        });

    }
    ngOnInit(): void {
        this.showSpinner = true;
        this.contactDetailForm = this.fb.group({
            address1: ['', [Validators.required]],
            addressStartdateDate: ['', [Validators.required]],
            address2: [''],
            city: ['', [Validators.required]],
            postalZipCode: ['', [Validators.required, this.postalCodeValidator.bind(this)]],
            country: [''],
            province: ['', [Validators.required]],
            personalEmail: ['', [this._customvalidationService.emailValidator()]],
            personalPhone: ['', [Validators.minLength(14)]],
            workPhone: ['', [Validators.minLength(14)]],
            preferredPhone: [''],
            communicationHistoryDate: [],
            communicationAttestation: [false]
        });


        let lookupseachitems: any = [
            AppConsts.lookupKeys.emailtype,
            AppConsts.lookupKeys.personPhoneType,
            AppConsts.lookupKeys.phoneFormatType,
            AppConsts.lookupKeys.personAddressType
        ];

        this._commonLookupServiceProxy.getLookupMultipleItems(lookupseachitems).subscribe(result => {
            this.MultipleResultData = result;
            if (this.MultipleResultData != null && this.MultipleResultData.length > 0) {

                this.emailLookupItems = this.MultipleResultData.filter(item => item.itemKey == AppConsts.lookupKeys.emailtype)[0].resultValue.items;
                this.allPhoneTypes = this.MultipleResultData.filter(item => item.itemKey == AppConsts.lookupKeys.personPhoneType)[0].resultValue.items;
                this.allPhoneFormatTypes = this.MultipleResultData.filter(item => item.itemKey == AppConsts.lookupKeys.phoneFormatType)[0].resultValue.items;
                this.allAddressTypes = this.MultipleResultData.filter(item => item.itemKey == AppConsts.lookupKeys.personAddressType)[0].resultValue.items;
            }
        });

        let province = this._commonLookupServiceProxy.getProvinceForCombobox('CA');

        combineLatest([province]).subscribe(([x]) => {
            this.allStateProvinces = x.items;
            // Check if data has been loaded for this member using sessionStorage
            const cacheKey = `communicationDataLoaded_${this.memberId}`;
            const isDataLoaded = this._sessionStorageHelper.getSecureSessionStorage(cacheKey) === 'true';
            
            // Only call API if data hasn't been loaded yet
            if (!isDataLoaded) {
                this.getMemberForEdit();
            } else {
                this.showSpinner = false;
            }
            this.hasEditAccess = this.isGranted('Pages.Members.Edit');
            if (!this.hasEditAccess) {
                this.contactDetailForm.disable();
            }

        });


        /* commented below code on 8th Sept 2024 K*S
        this._commonLookupServiceProxy.getLookupItems(AppConsts.lookupKeys.emailtype).subscribe(result => {
            this.emailLookupItems = result.items;
        });
        let phoneTypes = this._commonLookupServiceProxy.getLookupItems(AppConsts.lookupKeys.personPhoneType);
        this._commonLookupServiceProxy.getLookupItems(AppConsts.lookupKeys.phoneFormatType).subscribe(result => {
            this.allPhoneFormatTypes = result.items;
        });
        this._commonLookupServiceProxy.getLookupItems(AppConsts.lookupKeys.personAddressType).subscribe(result => {
                    this.allAddressTypes = result.items;
        });
        
        
        combineLatest([province,phoneTypes]).subscribe(([x,p]) => {  
            this.allStateProvinces = x.items;
            this,this.allPhoneTypes=p.items;
            this.getMemberForEdit();
            this.hasEditAccess = this.isGranted('Pages.Members.Edit');
            if (!this.hasEditAccess) {    
                this.contactDetailForm.disable();
            }
           
        });
        */

        this.userPermission();
        this.contactDetailForm.controls.communicationHistoryDate.patchValue(this.l('Current'));
        this.personAddressEntity = AppConsts.entityTypeFullName.PersonAddress;
        this.personPhoneEntity = AppConsts.entityTypeFullName.PersonPhone;
        this.communicationAttestationEntity = AppConsts.entityTypeFullName.CommunicationAttestation;
        this.personEmailEntity = AppConsts.entityTypeFullName.PersonEmail;

        setTimeout(() => {
            document.getElementById('addressStartdateDate').focus();
        }, 500);
    }
    ngAfterViewInit(): void {
        // setTimeout(() => {
        //     document.getElementById('autoFocus').focus();

        // }, 500);

        const elements1 = this.el.nativeElement.querySelectorAll('.p-hidden-accessible input');
        elements1.forEach(element => {
            this.renderer.setAttribute(element, 'aria-label', 'dropdown');
        });

        const elements = this.el.nativeElement.querySelectorAll('button.p-ripple');
        elements.forEach(element => {
            this.renderer.setAttribute(element, 'aria-label', 'paginator');
        });
    }

    postalCodeValidator(control: AbstractControl): { [key: string]: boolean } | null {

        if (control.value !== null && control.value.trim() != '') {
            let postalCodeRegex;
            let countryCode = '40';
            switch (countryCode.toString().trim()) {
                case '236':
                    postalCodeRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
                    break;
                case '40':
                    postalCodeRegex = /^([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])$/;
                    break;
                default:
                    postalCodeRegex = /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/;
            }
            const valid = postalCodeRegex.test(control.value);
            return valid ? null : { postalCodeValidator: true };
        }
        return null;
    }

    onSubmitMemberContactInfo() {
        this.submitted = true;
        let province: number = this.contactDetailForm.controls['province'].value;
        let effectiveDate: string = this.saveFormatString(this.contactDetailForm.controls['addressStartdateDate'].value);
        let prevAddressEffectiveDate = this.saveFormatString(this.prevAddressEffectiveDate);

        if (province != this.prevProvince && !(effectiveDate != prevAddressEffectiveDate) && this.addressChangePromptCount == 0) {
            this.message.confirm(
                this.l('AddressEffectiveDateCinfirmation'),
                ' ',
                (isConfirmed) => {
                    if (isConfirmed) {
                        this.addressChangePromptCount = 0;
                        this.saveMemberContactInfo()
                    }
                    else {
                        this.addressChangePromptCount = 0;
                        this.submitted = false;

                        return;
                    }
                }
            );
        }

        else {

            this.saveMemberContactInfo();


        }

    }

    saveMemberContactInfo() {
        let that = this;
        this.saving = true;
        this.submitted = true;
        this.memberPersonList.personAddressList = [];
        this.memberPersonList.personEmailList = [];
        this.memberPersonList.personPhoneList = [];

        this.person.id = this.personId;
        this.person.preferredLanguage = this.personMemberLanguage;
        this.person.firstName = this.personFirstName;
        this.person.secondName = this.personMidName;
        this.person.lastName = this.personLastName;
        this.person.dateOfBirth = this.saveFormatString(this.personBirthDate);
        this.person.gender = this.personGender;
        this.memberPersonList.person = this.person;
        this.memberPersonList.explicitMemberId = this.memberId;
        // if (this.isResidenceAddessRequired) {
        this.personAddress.id = this.personAddressResidenceId;
        this.personAddress.personId = this.personId;
        if (this.personAddress.id != undefined && this.personAddress.id != null) {
            this.personAddress.addressType = this.personAddressTypeResident;
        } else {
            let addressTypeValue = this.allAddressTypes.find(x => x.internalEntryName === 'Residential').value;
            this.personAddress.addressType = addressTypeValue;
        }
        this.personAddress.isPreferredAddress = true; // Hardcoded as on UI we are not taking any input for ispreffered
        this.personAddress.address1 = this.contactDetailForm.controls['address1'].value;
        this.personAddress.address2 = this.contactDetailForm.controls['address2'].value;
        this.personAddress.city = this.contactDetailForm.controls['city'].value;
        this.personAddress.postalZipCode = this.contactDetailForm.controls['postalZipCode'].value;
        this.personAddress.provinceStateId = this.contactDetailForm.controls['province'].value;
        this.personAddress.countryId = this.contactDetailForm.controls['country'].value;
        this.personAddress.startDate = this.saveFormatString(this.contactDetailForm.controls['addressStartdateDate'].value);
        this.memberPersonList.personAddressList.push(this.personAddress);
        if (this.contactDetailForm.controls['personalEmail'].value) {
            this.contactDetailForm.get('personalEmail').setValidators([this._customvalidationService.emailValidator()]);
            this.contactDetailForm.get('personalEmail').updateValueAndValidity();
            this.personEmailAddress.emailAddress = this.contactDetailForm.controls['personalEmail'].value;
            this.personEmailAddress.id = this.personEmailPersonalId;
            this.personEmailAddress.personId = this.personId;
            if (this.personEmailAddress.id != undefined && this.personEmailAddress.id != null) {
                this.personEmailAddress.emailType = this.personEmailTypePersonal;
            } else {
                let emailTypeValue = this.emailLookupItems.find(x => x.internalEntryName === 'Personal').value;
                this.personEmailAddress.emailType = emailTypeValue;
            }
            this.personEmailAddress.isPreferredeMail = true;
            this.memberPersonList.personEmailList.push(this.personEmailAddress);
        }

        this.personPhone.isPreferredPhone = false;
        this.personPhone.id = this.personPhoneCellId;
        this.personPhone.personId = this.personId;
        if (this.personPhone.id != undefined && this.personPhone.id != null) {
            this.personPhone.phoneType = this.personPhoneTypeCell;
            this.personPhone.phoneFormatType = this.personPhoneFormatTypeCell;
        } else {
            let phoneTypeValue = this.allPhoneTypes.find(x => x.internalEntryName === 'Cell').value;
            this.personPhone.phoneType = phoneTypeValue;
            let phoneFormatTypeValue = this.allPhoneFormatTypes.find(x => x.internalEntryName === 'International').value;
            this.personPhone.phoneFormatType = phoneFormatTypeValue;
        }



        let personalPhoneValue = this.contactDetailForm.controls['personalPhone'].value;
        if (personalPhoneValue !== "") {
            this.personPhone.phoneNumber = this.formatPhoneNumber(personalPhoneValue);
        }
        else {
            this.personPhone.phoneNumber = this.contactDetailForm.controls['personalPhone'].value;
        }


        this.memberPersonList.personPhoneList.push(this.personPhone);

        if (this.contactDetailForm.controls['preferredPhone'].value === 'Cell') {
            this.personPhone.isPreferredPhone = true;
            this.contactDetailForm.get('personalPhone').setValidators([Validators.required, Validators.minLength(14)]);
            this.contactDetailForm.get('personalPhone').updateValueAndValidity();
        } else {
            this.contactDetailForm.get('personalPhone').clearValidators();
            this.contactDetailForm.get('personalPhone').updateValueAndValidity();
        }

        this.personPhoneForWork.isPreferredPhone = false;
        this.personPhoneForWork.id = this.personPhoneBusinessId;
        this.personPhoneForWork.personId = this.personId;
        if (this.personPhoneForWork.id != undefined && this.personPhoneForWork.id != null) {
            this.personPhoneForWork.phoneType = this.personPhoneTypeBusiness;
            this.personPhoneForWork.phoneFormatType = this.personPhoneFormatTypeBusiness;
        } else {
            let phoneTypeValue = this.allPhoneTypes.find(x => x.internalEntryName === 'Business').value;
            this.personPhoneForWork.phoneType = phoneTypeValue;
            let phoneFormatTypeValue = this.allPhoneFormatTypes.find(x => x.internalEntryName === 'International').value;
            this.personPhoneForWork.phoneFormatType = phoneFormatTypeValue;
        }
        this.personPhoneForWork.phoneNumber = this.contactDetailForm.controls['workPhone'].value;
        this.memberPersonList.personPhoneList.push(this.personPhoneForWork);

        if (this.contactDetailForm.controls['preferredPhone'].value === 'Business') {
            this.personPhoneForWork.isPreferredPhone = true;
            this.contactDetailForm.get('workPhone').setValidators([Validators.required, Validators.minLength(14)]);
            this.contactDetailForm.get('workPhone').updateValueAndValidity();
        } else {
            this.contactDetailForm.get('workPhone').clearValidators();
            this.contactDetailForm.get('workPhone').updateValueAndValidity();
        }

        if (this.contactDetailForm.controls['preferredPhone'].value === 'Business') {
            if (this.contactDetailForm.get('personalPhone').value && this.contactDetailForm.get('personalPhone').value.length > 0) {
                this.contactDetailForm.get('personalPhone').setValidators([Validators.minLength(14)]);
                this.contactDetailForm.get('personalPhone').updateValueAndValidity();
            }
        } else if (this.contactDetailForm.controls['preferredPhone'].value === 'Cell') {
            if (this.contactDetailForm.get('workPhone').value && this.contactDetailForm.get('personalPhone').value.length > 0) {
                this.contactDetailForm.get('workPhone').setValidators([Validators.minLength(14)]);
                this.contactDetailForm.get('workPhone').updateValueAndValidity();
            }
        } else {
            if (this.contactDetailForm.get('personalPhone').value.length > 0) {
                this.contactDetailForm.get('personalPhone').setValidators([Validators.minLength(14)]);
                this.contactDetailForm.get('personalPhone').updateValueAndValidity();
            }

            if (this.contactDetailForm.get('workPhone').value.length > 0) {
                this.contactDetailForm.get('workPhone').setValidators([Validators.minLength(14)]);
                this.contactDetailForm.get('workPhone').updateValueAndValidity();
            }
        }

        //commented by shankar/sannee

        this.memberPerson.memberCharacteristic = null;

        if (!this.contactDetailForm.invalid && !this.isUsersExists) {

            this.saving = true;
            this._membersServiceProxy.createOrEditMemberPersonList(this.memberPersonList)
                .pipe(finalize(() => {
                    this.submitted = false; this.saving = false;
                }))
                .subscribe((result) => {
                    let attestationValue = this.contactDetailForm.controls['communicationAttestation'].value;
                    if (that.communicationAttestationOldValue != attestationValue) {
                        this._membersServiceProxy.saveMemberAttestationSelections(this.memberId, attestationValue).subscribe({
                            next: (attresult: any) => {
                                this.getMemberForEdit();
                            },
                            error: (error) => {
                                console.error(error);
                            }
                        });
                    }
                    else {
                        this.getMemberForEdit();
                    }
                    this.notify.info(this.l('MemberCommunicationSave'));
                    this.saving = false;
                    this.isCommunicationHistory = false;

                    this.isDirty = false;
                    if (this.contactDetailForm.controls['personalEmail'].value) {
                        this.memberEmailChangeEvent.emit(this.personEmailAddress.emailAddress);
                    }
                    // this.getMemberForEdit();
                    this.markFormAsPristineUnTouched();
                    //this.showcontent('communication');
                    this.addressChangePromptCount = 0;
                },
                    () => {
                        this.saving = false;
                    }
                );

        } else {
            this.saving = false;
        }
    }

    markFormAsPristineUnTouched() {

        Object.keys(this.contactDetailForm.controls).forEach((key) => {
            const control = this.contactDetailForm.controls[key];
            control.markAsPristine();
            control.markAsUntouched();
        });
    }

    getMemberForEdit() {
        this.clearFormValidations();
        this.isDirty = false;
        let that = this;
        this._membersServiceProxy.getMemberCommunicationForEdit(this.memberId, this.historyEffectiveDate
        ).subscribe(result => {
            // if (result.memberUserId != undefined && result.memberUserId != null) {
            //     this.memberUserId = result.memberUserId;
            // }  
            if (result.person != undefined && result.person != null) {
                this.personId = result.person.id;
                if (!this.isCommunicationHistory) {
                    this.getHistoryDates(result.person.id);
                }

                this.personFirstName = result.person.firstName;
                this.personMidName = result.person.secondName;
                this.personLastName = result.person.lastName;
                this.personGender = result.person.gender;
                this.personBirthDate = this.formateDate(result.person.dateOfBirth);
                this.personMemberLanguage = result.person.preferredLanguage;

            }

            if (result.personEmail != undefined && result.personEmail != null) {
                this.contactDetailForm.get('personalEmail').clearValidators();
                this.contactDetailForm.get('personalEmail').updateValueAndValidity();
                this.MemberEmail = '';
                result.personEmail.forEach(element => {
                    this.personEmailPersonalId = element.id;
                    this.personEmailTypePersonal = element.emailType;
                    this.contactDetailForm.controls.personalEmail.patchValue(element.emailAddress);
                    this.MemberEmail = element.emailAddress;
                    this.originalEmailId = this.MemberEmail;
                });
            } else {
                this.contactDetailForm.get('personalEmail').setValidators([this._customvalidationService.emailValidator(), this.validateEmailViaServer.bind(this)]);
                this.contactDetailForm.get('personalEmail').updateValueAndValidity();
            }

            if (result.personPhone != undefined && result.personPhone != null) {
                result.personPhone.forEach(element => {
                    if (this.allPhoneTypes) {
                        let phoneTypeText = this.allPhoneTypes.find(x => x.value == element.phoneType).internalEntryName;
                        if (phoneTypeText == 'Cell') {
                            this.personPhoneCellId = element.id;
                            this.personPhoneTypeCell = element.phoneType;
                            this.personPhoneFormatTypeCell = element.phoneFormatType;
                            this.contactDetailForm.controls.personalPhone.patchValue(element.phoneNumber);
                            if (element.isPreferredPhone) {
                                this.contactDetailForm.controls.preferredPhone.patchValue('Cell');
                                this.isPreferredPhoneAuditId = this.personPhoneCellId;
                            }

                        } else if (phoneTypeText == 'Business') {
                            this.personPhoneBusinessId = element.id;
                            this.personPhoneTypeBusiness = element.phoneType;
                            this.personPhoneFormatTypeBusiness = element.phoneFormatType;
                            this.contactDetailForm.controls.workPhone.patchValue(element.phoneNumber);
                            if (element.isPreferredPhone) {
                                this.contactDetailForm.controls.preferredPhone.patchValue('Business');
                                this.isPreferredPhoneAuditId = this.personPhoneBusinessId;
                            }
                        }
                    }
                });
            }
            if (result.member != undefined && result.member != null) {
                this.contactDetailForm.controls.addressStartdateDate.patchValue(this.formateDate(result.personAddress.startDate));

                if (result.member.benefitEligibilityDate) {
                    sessionStorage.setItem('flowMemberEligibilityDate', '');
                }
                this.prevAddressEffectiveDate = this.formateDate(result.personAddress.startDate);

            }
            if (result.personAddressList != undefined && result.personAddressList != null) {
                result.personAddressList.forEach(element => {
                    this.personAddressResidenceId = element.id;
                    this.personAddressTypeResident = element.addressType;
                    this.contactDetailForm.controls.address1.patchValue(element.address1);
                    this.contactDetailForm.controls.address2.patchValue(element.address2);
                    this.contactDetailForm.controls.city.patchValue(element.city);
                    this.contactDetailForm.controls.postalZipCode.patchValue(element.postalZipCode);
                    this.contactDetailForm.controls.country.patchValue(element.countryId);
                    this.contactDetailForm.controls.province.patchValue(element.provinceStateId);
                    this.contactDetailForm.controls.addressStartdateDate.patchValue(this.formateDate(element.startDate));
                    this.prevProvince = element.provinceStateId;

                });
            }
            this.contactDetailForm.controls.communicationAttestation.patchValue(result.communicationAttestation);
            that.communicationAttestationOldValue = result.communicationAttestation;
            this.isCommunicationAttestationAuditId = result.communicationAttestationId;
            this.markFormAsPristineUnTouched();
            this.showSpinner = false;
            // Mark data as loaded in sessionStorage after successful API call
            const cacheKey = `communicationDataLoaded_${this.memberId}`;
            this._sessionStorageHelper.setSecureSessionStorage(cacheKey, 'true');
            this.changeDetectionForm();

        }, (error) => this.apiError());


    }


    getHistoryDates(personId: number): void {
        this.communicationHistory = [];
        this.communicationHistory.push(this.l('Current'));
        this._membersServiceProxy.getCommunicationHistoryDates(personId)
            .subscribe((result) => {
                result.forEach((element) => {
                    this.communicationHistory.push(this.formateDate(element));
                });
            });
    }



    changeDetectionForm() {

        this.contactDetailForm.valueChanges.subscribe(val => {
            this.isDirty = this.contactDetailForm.dirty;
        });
    }
    validateEmailViaServer(value) {
        this.showSpinner = true;
        this.emailResponse = false;
        if (value.indexOf('@') !== -1) {
            this._membersServiceProxy.isUserUnique(value).pipe(debounceTime(1000))
                .subscribe((users) => {
                    this.showSpinner = false;
                    this.emailResponse = true;
                    this.isUsersExists = users ? true : false;
                    const control = this.contactDetailForm.controls['personalEmail'];
                    if (users) {
                        control.setErrors({ isUsersExists: true });
                    } else {
                        this.onSubmitMemberContactInfo();
                        control.setErrors(null);
                    }
                }, (error) => {
                    this.apiError();

                    this.emailResponse = true;
                });
        }
    }




    get registerContactFormControl() {
        return this.contactDetailForm.controls;
    }

    userPermission() {

        this.isCommunicationInfoReadOnlyAccess = this.isGranted('Pages.Member.CommunicationInfo.View');
        this.isCommunicationInfoEditAccess = this.isGranted('Pages.Member.CommunicationInfo.Edit');
        if (this.isCommunicationInfoReadOnlyAccess && !this.isCommunicationInfoEditAccess) {
            this.contactDetailForm.disable();
        }
        else if (this.isCommunicationInfoEditAccess) {

            this.contactDetailForm.enable();
        }
    }


    clearFormValidations() {
        this.contactDetailForm.get('personalPhone').clearValidators();
        this.contactDetailForm.get('personalPhone').updateValueAndValidity();
        this.contactDetailForm.get('workPhone').clearValidators();
        this.contactDetailForm.get('workPhone').updateValueAndValidity();
        this.contactDetailForm.get('personalEmail').clearValidators();
        this.contactDetailForm.get('personalEmail').updateValueAndValidity();
        this.contactDetailForm.get('address1').clearValidators();
        this.contactDetailForm.get('city').clearValidators();
        this.contactDetailForm.get('postalZipCode').clearValidators();
        this.contactDetailForm.get('province').clearValidators();
        this.contactDetailForm.get('address1').updateValueAndValidity();
        this.contactDetailForm.get('city').updateValueAndValidity();
        this.contactDetailForm.get('postalZipCode').updateValueAndValidity();
        this.contactDetailForm.get('province').updateValueAndValidity();
    }

    isValidEmail(email: string): boolean {
        const emailRegexp = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9!'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        return emailRegexp.test(email);

    }

    onChangeEmailAddressEvent(event: any) {
        let currentEmail = event.target.value;
        if (!this.isValidEmail(currentEmail)) {
            this.isUsersExists = false;
            return;
        }


        if (currentEmail.indexOf('@') !== -1) {
            this._membersServiceProxy.isUserUnique(currentEmail).
                subscribe(val => {
                    if (val) {
                        this.isUsersExists = true;
                    }
                    else {
                        this.isUsersExists = false;
                    }
                });

        }


        if (![undefined, null, ''].includes(currentEmail)) {

            this.isUsersExists = false;
            if (this.MemberEmail.toLowerCase() === currentEmail.toLowerCase()) {
                this.contactDetailForm.get('personalEmail').clearValidators();
                this.contactDetailForm.get('personalEmail').updateValueAndValidity();
            }
            else {
                this.contactDetailForm.get('personalEmail').setValidators([this._customvalidationService.emailValidator()]);
                this.contactDetailForm.get('personalEmail').updateValueAndValidity();
            }
        }
        else {
            this.contactDetailForm.get('personalEmail').clearValidators();
            this.contactDetailForm.get('personalEmail').updateValueAndValidity();
        }
    }


    handlePreferredPhoneType(preferPhone: any, type: string) {
        let personalPhoneValue = this.contactDetailForm.controls['personalPhone'].value;
        let personalPhoneCtrl = this.contactDetailForm.get('personalPhone');
        if (personalPhoneValue !== "" || personalPhoneValue !== null || personalPhoneValue !== undefined) {
            personalPhoneValue = this.formatPhoneNumber(personalPhoneValue);
            this.contactDetailForm.controls.personalPhone.patchValue(personalPhoneValue);
        }

        let phoneLength = this.checkLengthonCopyPaste(personalPhoneValue);
        let workPhoneValue = this.contactDetailForm.controls['workPhone'].value;
        if (workPhoneValue !== "") {
            workPhoneValue = this.formatPhoneNumber(workPhoneValue);
            this.contactDetailForm.controls.workPhone.patchValue(workPhoneValue);
        }

        let workPhoneLength = this.checkLengthonCopyPaste(workPhoneValue);
        let workPhoneCtrl = this.contactDetailForm.get('workPhone');
        if (type == 'personalPhone' && phoneLength == 10) {
            personalPhoneCtrl.clearValidators();
            personalPhoneCtrl.updateValueAndValidity();
        }
        else if (type == 'workedPhone' && workPhoneLength == 10) {
            workPhoneCtrl.clearValidators();
            workPhoneCtrl.updateValueAndValidity();
        }
        else {
            personalPhoneCtrl.clearValidators();
            workPhoneCtrl.clearValidators();
            personalPhoneCtrl.updateValueAndValidity();
            workPhoneCtrl.updateValueAndValidity();
            if (preferPhone == 'Cell') {
                if (this.checkLengthonCopyPaste(personalPhoneValue) != 10) {
                    personalPhoneCtrl.setValidators(Validators.compose([Validators.required, Validators.minLength(14)]));
                    personalPhoneCtrl.updateValueAndValidity();
                }

                if (workPhoneValue.length > 0 && this.checkLengthonCopyPaste(workPhoneValue) != 10) {
                    workPhoneCtrl.setValidators(Validators.compose([Validators.minLength(14)]));
                    workPhoneCtrl.updateValueAndValidity();
                } else {
                    workPhoneCtrl.updateValueAndValidity();
                }

            } else if (preferPhone == 'Business') {
                if (this.checkLengthonCopyPaste(workPhoneValue) != 10) {
                    workPhoneCtrl.setValidators(Validators.compose([Validators.required, Validators.minLength(14)]));
                    workPhoneCtrl.updateValueAndValidity();
                }

                if (personalPhoneValue.length > 0 && this.checkLengthonCopyPaste(personalPhoneValue) != 10) {
                    personalPhoneCtrl.setValidators(Validators.compose([Validators.minLength(14)]));
                    personalPhoneCtrl.updateValueAndValidity();
                } else {
                    personalPhoneCtrl.updateValueAndValidity();
                }
            } else {
                if (this.checkLengthonCopyPaste(personalPhoneValue) != 10) {
                    personalPhoneCtrl.setValidators(Validators.compose([Validators.minLength(14)]));
                    personalPhoneCtrl.updateValueAndValidity();
                }

                if (this.checkLengthonCopyPaste(workPhoneValue) != 10) {
                    workPhoneCtrl.setValidators(Validators.compose([Validators.minLength(14)]));
                    workPhoneCtrl.updateValueAndValidity();
                }

            }

        }
    }
    checkLengthonCopyPaste(inputPhone): number {
        var regex = /\d+/g;
        var matches = inputPhone;
        if (matches && matches.toString().length > 0) {
            var val = matches.toString().match(regex);
            if (val) {
                let resVal = val.join('');
                return resVal.length;
            }

        }
    }
    onChangeHistoryddn() {
        let selectedHistoryDate = '';
        if (this.contactDetailForm.controls['communicationHistoryDate'].value == this.l('Current')) {
            this.isCommunicationHistory = false;

            this.historyEffectiveDate = undefined;
        } else {
            this.isCommunicationHistory = true;
            this.historyEffectiveDate = this.contactDetailForm.controls['communicationHistoryDate'].value
        }
        this.communicationHistoryFormInputFieledChange();
        this.getMemberForEdit();
    }

    communicationHistoryFormInputFieledChange() {
        if (this.isCommunicationHistory) {
            this.contactDetailForm.disable();
            this.contactDetailForm.get('communicationHistoryDate').enable();
        } else {
            this.contactDetailForm.enable();
        }
    }

    showFieldHistory3(fieldName: string, _entityTypeFullName: string, entityId: any, isLookUp?: boolean, displayName?: string): void {
        this.fieldTypeHistoryModal.historyFieldName = '';
        if (displayName == '' || displayName == undefined) {
            displayName = fieldName;
        }
        this.fieldTypeHistoryModal.show({
            entityTypeFullName: _entityTypeFullName,
            entityId: entityId,
            propertyName: fieldName,
            displayName: displayName,
            isLookUp: (isLookUp == undefined) ? false : isLookUp
        });
    }

    postalCodeSpace(e: any) {
        if (e.target.value.length <= 6) {
            e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/(.{3})/g, '$1 ').trim();
        }
    }

    onSave() {
        if (this.isUsersExists) {
            return;
        }
        if (this.contactDetailForm.controls['personalEmail'].value == "") {
            this.onSubmitMemberContactInfo();
        }
        else {

            this.onSubmitMemberContactInfo();

        }
    }

    clearValidation(): void {
        this.isUsersExists = false;
    }

    onDateChange(newDate: any): void {
        if (this._sessionStorageHelper.getSecureSessionStorage(AppConsts.sessionkey.TPAAdminRetrodatelimitApplicable) != undefined) {
            let isApplicable = Boolean(this._sessionStorageHelper.getSecureSessionStorage(AppConsts.sessionkey.TPAAdminRetrodatelimitApplicable));
            this.prevaddressStartdateDate = this.prevaddressStartdateDate ?? this.contactDetailForm.controls.addressStartdateDate.value;
            if (isApplicable && !(newDate == this.prevaddressStartdateDate)) {
                this._commonLookupServiceProxy.tpaVerifyMaximumDate(this.formateDate(newDate)).subscribe(result => {
                    if (!result) {
                        this.message.warn(this.l('EffectiveDateBeyondLimit')).then(() => {
                            this.contactDetailForm.controls.addressStartdateDate.patchValue('');
                        });
                    }
                }, (error) => this.apiError());
            }
        }
    }
}