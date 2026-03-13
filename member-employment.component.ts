import { AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, Renderer2, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { MemberClassChangeOutput, MemberDivisionChangeOuput, MemberOrganisationDetails } from "../member-details-component";
import { CommonLookupServiceProxy, CreateOrEditDirectBillingInformation, CreateOrEditMemberBenefitCharacteristicDto, CreateOrEditMemberClassEnrollmentDto, CreateOrEditMemberCostCenter, CreateOrEditMemberDivisionDto, CreateOrEditMemberDto, CreateOrEditMemberIdsDto, CreateOrEditMemberPersonDto, CreateOrEditOrganizationSettingDto, CreateOrEditPersonDto, KeyValuePairDto, LookUpInputDto, MembersServiceProxy, MemberUniqueOutputDto, OptionsetDto, OrganizationsServiceProxy } from "@shared/service-proxies/service-proxies";
import moment from "moment";
import { AppConsts } from "@shared/AppConsts";
import { debounceTime, finalize } from "rxjs/operators";
import { combineLatest } from "rxjs/internal/observable/combineLatest";
import * as $ from 'jquery';
import { CreateOrEditMemberclassComponent } from "../memberclass/create-or-edit-memberclass.component";
import { CreateOrEditMemberDivisionModalComponent } from "../../memberDivisions/create-or-edit-memberDivision-modal.component";
import { CreateOrEditMemberStatusModalComponent } from "../../memberStatus/create-or-edit-memberStatus-modal.component";
import { CreateorEditMemberCostCenterModalComponent } from "../../memberCostCenter/create-or-edit-memberCostCenter-modal.component";
import { EntityFieldDetailModalComponent } from "@app/shared/common/entityHistory/field-type-history-model.component";
import { result } from "lodash";
import { MemberDirectBillingInfoModalComponent } from "../../member-financials-panel/member-direct-billing-info-modal/member-direct-billing-info-modal.component";
import { SharedService } from "@app/shared/common/data-service/shared.service";
import { ChangeHireDateOrBenefitEffectiveDateModalComponent } from "../change-hiredate-or-benefit-effectivedate/change-hiredate-or-benefit-effectivedate.component";
import { SessionStorageHelper } from "@shared/helpers/SessionStorage.helper";
import { ChangeCriticalChangeDateComponent } from "../change-criticalchangedate/change-criticalchangedate.component";



@Component({
    selector: 'member-employment',
    templateUrl: './member-employment.component.html',
    styleUrls: ['./member-employment.component.css'],
    animations: [appModuleAnimation()]
})

export class MemberEmploymentDetail extends AppComponentBase implements OnInit, AfterViewInit {

    empInfoFormOne: FormGroup;
    reloadMemberSalaryPanel = "";
    isDirty = false;
    memberId: number;
    orgId: number;
    orgPlansonsorId: number;
    personId: number;
    memberUserId: number = 0;
    memberCallingParam = '';
    historyEffectiveDate: string;
    memberstatusName: string;
    memberdivisionName: string;
    memberclassName: string;
    membercostCenterName: string;
    memberOrganisationDetails = new MemberOrganisationDetails();
    memberEditCostCenterName: string;
    membercostCenterEffDate: string;
    isCommunicationHistory = false;
    memberSmokerId: number;
    submitted = false;
    showSpinner = false;
    memberClassId: number;
    saving: boolean;
    person: CreateOrEditPersonDto = new CreateOrEditPersonDto();
    memberUniqueValidation: MemberUniqueOutputDto = new MemberUniqueOutputDto();
    memberCharacteristicList: KeyValuePairDto[] = [];
    member: CreateOrEditMemberDto = new CreateOrEditMemberDto();
    memberPerson: CreateOrEditMemberPersonDto = new CreateOrEditMemberPersonDto();
    memberCharcter: CreateOrEditMemberBenefitCharacteristicDto = new CreateOrEditMemberBenefitCharacteristicDto();
    memberOccupationId: number;
    memberAltCertificate: CreateOrEditMemberIdsDto = new CreateOrEditMemberIdsDto();
    memberCertificateId: number;
    selectedMemberDivisionId: number;
    personMemberLanguage: number;
    personFirstName: string;
    personMidName: string;
    personLastName: string;
    personGender: number;
    personBirthDate: string;
    dateOfBirth: string;
    certificateNumberId: number;
    memberAltNumber = '';
    ddnDivisions: any;
    ddlMemberClass: any;
    //planMemberStatus: any;
    statusChangeDate: string;
    options = {
        confirmButtonText: this.l('Yes'),
        cancelButtonText: this.l('No'),
    };
    selectedMemberClassId: number;
    selectedMemberStatusId: number;
    selectedMemberCostCenterId: number;
    plansponsorCostCenterId: number;
    memberstatusNameKey = '';
    hasEditAccess = false;
    isMemberNumberExist = false;
    @ViewChild('entityFieldDetailModal', { static: true }) fieldTypeHistoryModal: EntityFieldDetailModalComponent;
    @ViewChild('createOrEditMemberclassModal', { static: true }) createOrEditMemberclassModal: CreateOrEditMemberclassComponent;
    @ViewChild('createOrEditMemberDivisionModal', { static: true }) createOrEditMemberDivisionModal: CreateOrEditMemberDivisionModalComponent;
    @ViewChild('createOrEditMemberStatusModal', { static: true }) createOrEditMemberStatusModal: CreateOrEditMemberStatusModalComponent;
    @ViewChild('createorEditMemberCostCenterModal', { static: true }) createorEditMemberCostCenterModal: CreateorEditMemberCostCenterModalComponent;
    @ViewChild('changeHireDateOrBenefitEffectiveDateModal', { static: true }) changeHireDateOrBenefitEffectiveDateModal: ChangeHireDateOrBenefitEffectiveDateModalComponent;
    @ViewChild('changechangecriticalchangeDateModal', { static: true }) changechangecriticalchangeDateModal: ChangeCriticalChangeDateComponent;
    isEmploymentInfoReadOnlyAccess = false;
    isEmploymentInfoEditAccess = false;
    currentMemberAltNumber: string;
    isSpinner: boolean;
    memberNumberLength: number = 0;
    memberNumberLengthError = '';
    @Output() createOrEditMemberDetails: EventEmitter<CreateOrEditMemberDto> = new EventEmitter<CreateOrEditMemberDto>();
    memberDetails: CreateOrEditMemberDto = new CreateOrEditMemberDto();
    memberMaritalStatusId: number;
    firstNationStatusId: number;
    hireDateExported: string;
    extendingNewHire = false;
    memberEnrolmentWindow: string;
    memberIdsEntity: string;
    memberEntity: string;
    personAddressEntity: string;
    personPhoneEntity: string;
    personEmailEntity: string;
    memberEnrolmentWindowId = 0;
    isMemberHasBenefits: boolean = false;
    planMemberBenefitStatus: OptionsetDto[];
    MemberNumber = false;
    lang:string;
    memberDivisionChangeOuput = new MemberDivisionChangeOuput();
    memberClassChangeOutput = new MemberClassChangeOutput();
    @Output() divisionChangeEvent = new EventEmitter<any>();
    @Output() classChangeEvent = new EventEmitter<any>();
    @Output() costCenterChangeEvent = new EventEmitter<any>();
    @Output() memberStatusChangeEvent = new EventEmitter<any>();
    @Output() directBillingInformationChangeEvent = new EventEmitter<any>();
    IsCostcenterDisable: boolean = false;
    costCenter: CreateOrEditOrganizationSettingDto = new CreateOrEditOrganizationSettingDto();
    lookUpInputs: LookUpInputDto[];
    lookUpSubkeys: OptionsetDto[];
    memberBilling: OptionsetDto[];
    memberDirectBilling: CreateOrEditDirectBillingInformation = new CreateOrEditDirectBillingInformation();
    billingIndicator = "";
    billingIndicatorEffectiveDate = "";
    billingIndicatorId = 0;
    userId: number | undefined;
    isRolePlanSponsorAdmin=false;
    Inactive="";
    // added on 7th Sept 2024 K*C
    @Input() planMemberStatus: any;
    prevHireDate: string;
    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private fb: FormBuilder,
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _membersServiceProxy: MembersServiceProxy,
        private _commonLookupServiceProxy: CommonLookupServiceProxy,
        private _organizationsServiceProxy: OrganizationsServiceProxy,
        private _sharedDataService: SharedService,
        private _sessionStorageHelper: SessionStorageHelper,
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

    ngOnInit(): void {
        this.lang = abp.localization.currentLanguage.name;
        this.showSpinner = true;
        this.memberUniqueValidation.iserror = false;
        this.empInfoFormOne = this.fb.group({
            memberNumber: [null, [Validators.required]],
            hireDate: ['', [Validators.required]],
            divisionEffDate: [''],
            statusChangeDate: [''],
            memberBenefitStatus: [''],
            benefitEffDate: ['', [Validators.required]],
            classEffDate: [''],
            occupation: [''],
            CertificateNumber: ['', [Validators.maxLength(50)]],
            memberEnrollmentEndDate: [''],
            costCenterEffDate: [''],
            billingIndicator: [''],
            billingIndicatorEffectiveDate: [''],
            costCentervalue: [''],
            memberCriticalChangeDate: ['']
        });
        
        // commented on 17th Sept 2024 K*C
       // let division = this._membersServiceProxy.getDivisionForSearchddnAll(this.orgPlansonsorId, false);
        
        //let classes = this._membersServiceProxy.getDropdownListPlanSponsorMemberClass(this.orgId);
        //let memberStatuses = this._commonLookupServiceProxy.getLookupItems(AppConsts.lookupKeys.planMemberStatus);
        this._membersServiceProxy.getMembernumberLength(this.orgPlansonsorId)
            .subscribe((result) => {
                this.memberNumberLength = result;
                this.memberNumberLengthError = this.l('MemberNumberEnteredBelowSetupLimit').replace('#', this.memberNumberLength.toString());
            });

            // Dropdown related to  planMemberBenefitStatus is hidden in html hence removing it K*C on 18th Sept
        // this._commonLookupServiceProxy.getLookupItems(AppConsts.lookupKeys.planMemberBenefitStatus).subscribe(result => {
        //     this.planMemberBenefitStatus = result.items;
        // });

        // Commented on 7th Sept 2024 K*C-- didn't find reference for this method call
        // this._commonLookupServiceProxy.getMemberBillingInformationDropDown().subscribe(result => {
        //     this.memberBilling = result.items;
        // });
        // combineLatest([division, classes, memberStatuses]).subscribe(([x, y, p]) => {
        //     this.ddnDivisions = x;
        //     this.ddlMemberClass = y;
        //     this.planMemberStatus = p.items;

        //     this.getMemberForEdit();
        // });

        // combineLatest([division, classes]).subscribe(([x, y]) => {
        //     this.ddnDivisions = x;
        //     this.ddlMemberClass = y;
        //     // commented below code as it's value retrieved from input property
        //     //this.planMemberStatus = p.items;

        //     this.getMemberForEdit();
        // });
        
        // Check if data has been loaded for this member using sessionStorage
        const cacheKey = `employmentDataLoaded_${this.memberId}`;
        const isDataLoaded = this._sessionStorageHelper.getSecureSessionStorage(cacheKey) === 'true';
        
        // Only call API if data hasn't been loaded yet
        if (!isDataLoaded) {
            this.getMemberForEdit();
        } else {
            this.showSpinner = false;
        }

        this.userPermission();
        this.lookUpInputs = [];
        this.fillSubKeysData();
        // commented below code as it's not required-- K*C on 18th Sept 2024
       // this.getOrganizations(this.orgPlansonsorId);
        this.memberEnrolmentWindow = AppConsts.entityTypeFullName.MemberEnrolmentWindow;
        this.memberIdsEntity = AppConsts.entityTypeFullName.MemberIds;
        this.memberEntity = AppConsts.entityTypeFullName.Member;
        this.personAddressEntity = AppConsts.entityTypeFullName.PersonAddress;
        this.personPhoneEntity = AppConsts.entityTypeFullName.PersonPhone;
        this.personEmailEntity = AppConsts.entityTypeFullName.PersonEmail;
        const canUpdateHireDate = this.isGranted('Customs.CanOverrideMemberEffectiveDate');
        if (!canUpdateHireDate) {
            this.empInfoFormOne.get('hireDate').disable();
            this.empInfoFormOne.get('benefitEffDate').disable();
        }

        setTimeout(() => { 
            document.getElementById('member_number').focus();
        }, 500);

        this._commonLookupServiceProxy.getFPESettingValue(AppConsts.tenantSettingType.MemberDataChangeDateLimit).subscribe(result => {
            //this.maxEnrollmentDays = parseInt(result);
            
            this._sharedDataService.SetmaxEnrollmentDays(parseInt(result));
        });
       
        this.isRolePlanSponsorAdmin = this.userRoleGroup === AppConsts.lookupKeys.plansponsorAdministrator ? true : false;
        this.Inactive=AppConsts.lookupKeys.Inactive;
    }
    get empInfoFormOneGet() {
        return this.empInfoFormOne.controls;
    }

    getMemberForEdit() {
        this.isDirty = false;
        this._membersServiceProxy.getMemberEmploymentForEdit(this.memberId, this.historyEffectiveDate
        ).subscribe(result => {
            // if (result.memberDirectBillingInformation != null && result.memberDirectBillingInformation != undefined) {
            //     this.memberDirectBilling.id = result.memberDirectBillingInformation.id;
            //     this.billingIndicatorId = result.memberDirectBillingInformation.id;
            //     this.memberDirectBilling.directBillingInfoId = result.memberDirectBillingInformation.directBillingInfoId;
            //     this.memberDirectBilling.memberDirectBillingInfo = result.memberDirectBillingInformation.memberDirectBillingInfo;
            //     this.memberDirectBilling.memberId = result.memberDirectBillingInformation.memberId;
            //     this.memberDirectBilling.statusEffectiveDate = result.memberDirectBillingInformation.statusEffectiveDate;
            // }
            if (result.person != undefined && result.person != null) {
                this.personId = result.person.id;
                if (result.memberSmokerStatus != null) {
                    this.memberSmokerId = result.memberSmokerStatusId;
                }
                if (result.memberMaritalStatus != null) {
                    this.memberMaritalStatusId = result.memberMaritalStatusId;
                }
                if (result.firstNationStatus != null) {

                    this.firstNationStatusId = result.firstNationStatusId;
                }
                if (result.costCenterName != undefined && result.costCenterName != null) {
                    this.memberEditCostCenterName = result.costCenterName;
                }
                this.personFirstName = result.person.firstName;
                this.personMidName = result.person.secondName;
                this.personLastName = result.person.lastName;
                this.personGender = result.person.gender;
                this.personBirthDate = this.formateDate(result.person.dateOfBirth);
                this.personMemberLanguage = result.person.preferredLanguage;
                this.dateOfBirth = this.personBirthDate;
            }

            if (result.member != undefined && result.member != null) {
                this.empInfoFormOne.controls.memberNumber.patchValue(result.member.orgPlanMemberNumber);
                this.empInfoFormOne.controls.hireDate.patchValue(this.formateDate(result.member.dateofhire));
                this.hireDateExported = this.standardDate(result.member.dateofhire);
                if (result.member.benefitEligibilityDate) {
                    this.empInfoFormOne.controls.benefitEffDate.patchValue(this.formateDate(result.member.benefitEligibilityDate));
                    sessionStorage.setItem('flowMemberEligibilityDate', '');
                }
                // commented below code and added 2 parameters K*C
                //this.setDivisionName(result.memberdivision);
                this.setDivisionName(result.memberdivision,result.divisionCode,result.divisionName);
                this.setStatusName(result.planMemberStatusId);
                this.setChangeStatusDate(this.formateDate(result.planMemberStatusEffDate));
                // commented below code and added 2 parameters
                //this.setClassName(result.member.clientBenefitClassification);
                this.setClassName(result.member.clientBenefitClassification,result.memberClassCode,result.memberClassName);
                // this is also not required here, it will be shifted to Banking Tab
                //this.setMemberDirectBilling(this.memberDirectBilling.id, result.memberDirectBillingInformation)
                this.empInfoFormOne.controls.divisionEffDate.patchValue(this.formateDate(result.memberDivisionEffDate));
                this.empInfoFormOne.controls.statusChangeDate.patchValue(this.formateDate(result.planMemberStatusEffDate));

                (<HTMLInputElement>document.getElementById('_statusChangeDate')).innerText = this.empInfoFormOne.controls['statusChangeDate'].value;

                this.empInfoFormOne.controls.memberBenefitStatus.patchValue(result.member.planMemberBenefitStatus);
                this.empInfoFormOne.controls.classEffDate.patchValue(this.formateDate(result.memberClassEffDate));
                 this.empInfoFormOne.controls.memberCriticalChangeDate.patchValue(this.formateDate(result.memberCriticalChangeDate));
                this.empInfoFormOne.controls.occupation.patchValue(result.memberOccupation);
                this.memberOccupationId = result.memberOccupationId;
                let memberEnrollmentEndDate = result.memberEnrollmentEndDate ? result.memberEnrollmentEndDate.replace('a.m.', 'am').replace('p.m.', 'pm') : null;  
                this.empInfoFormOne.controls.memberEnrollmentEndDate.patchValue(memberEnrollmentEndDate ? this.formateDate(moment(memberEnrollmentEndDate)) : null);
                this.memberEnrolmentWindowId = result.memberEnrolmentWindowId;
                this.isMemberHasBenefits = result.isMemberHasBenefits;

                //Binding the cost center values
                if (result.costCenterEffDate != undefined && result.costCenterEffDate != null) {
                    this.empInfoFormOne.controls.costCenterEffDate.patchValue(this.formateDate(result.costCenterEffDate));
                }
                if (result.costCenterId != undefined) {
                    this.plansponsorCostCenterId = result.psCostCenterId;
                    this.setCostCenterName(result.costCenterId);
                }
            }

            this.memberOrganisationDetails.PlanSponsorName = result.planSponsorName;
            this.memberOrganisationDetails.PlanSponsorCode = result.planSponsorCode;
            this.memberOrganisationDetails.DivisionName = result.divisionName;
            this.memberOrganisationDetails.DivisionCode = result.divisionCode;
            this.memberOrganisationDetails.MemberClassCode = result.memberClassCode;
            this.memberOrganisationDetails.MemberClassName = result.memberClassName;
            if (result.memberAlternateCertificate) {
                this.empInfoFormOne.get('CertificateNumber').clearValidators();
                this.empInfoFormOne.get('CertificateNumber').updateValueAndValidity();
                this.memberCertificateId = result.memberAlternateCertificate.id;
                this.memberAltNumber = '';
                this.empInfoFormOne.controls.CertificateNumber.patchValue(result.memberAlternateCertificate.memberAltId);
                this.memberAltNumber = result.memberAlternateCertificate.memberAltId;
                this.certificateNumberId = result.memberAlternateCertificate.id;
            }


            this.memberClassId = result.memberClassId;
            this.markFormAsPristineUnTouched();
            this.showSpinner = false;
            // Mark data as loaded in sessionStorage after successful API call
            const cacheKey = `employmentDataLoaded_${this.memberId}`;
            this._sessionStorageHelper.setSecureSessionStorage(cacheKey, 'true');
            this.changeDetectionForm();


        }, (error) => this.apiError());

    }
    onSubmitMemberEmployementInfo() { 
        this.saving = true;
        this._membersServiceProxy
            .isMemberUnique(this.empInfoFormOne.controls['memberNumber'].value, this.orgId, null, null, this.memberId
            )
            .pipe(finalize(() => { this.submitted = false; this.saving = false; }))
            .subscribe((response) => {
                this.isMemberNumberExist = response.iserror;
                this.memberUniqueValidation = response;
                this.isSpinner = false;
                if (response.iserror) {
                    this.saving = false;
                    this.submitted = false;
                    return;
                }
                else {
                    this.updateMemberEmployementInfo();
                }
            }, (error) => {

            this.isSpinner = false;
            this.apiError();
        });}

        updateMemberEmployementInfo() {

        if (this.empInfoFormOne.invalid) {
            this.saving = false;
            this.submitted = false;
            return;
        }

        // if ((moment(this.empInfoFormOne.controls['benefitEffDate'].value) > moment(this.empInfoFormOne.controls['statusChangeDate'].value))
        //     && (moment(this.empInfoFormOne.controls['benefitEffDate'].value) > moment(this.empInfoFormOne.controls['divisionEffDate'].value))
        //     && (moment(this.empInfoFormOne.controls['benefitEffDate'].value) > moment(this.empInfoFormOne.controls['classEffDate'].value))) {
        //     this.message.warn(this.l('ClassDivisionStatusSalaryEffectiveDatesCannotLessToBenefitEffectiveDate'));
        //     this.saving = false;
        //     this.submitted = false;
        //     return;
        // }
        // let salaryStartDate = document.getElementById('_salaryStartDate') ? (<HTMLInputElement>document.getElementById('_salaryStartDate')).innerText : null;
        // if (moment(this.empInfoFormOne.controls['benefitEffDate'].value) > moment(salaryStartDate)) {
        //     this.message.warn(this.l('ClassDivisionStatusSalaryEffectiveDatesCannotLessToBenefitEffectiveDate'));
        //     this.saving = false;
        //     this.submitted = false;
        //     return;
        // }
        this.memberCharacteristicList = [];
        this.person.id = this.personId;
        this.person.preferredLanguage = this.personMemberLanguage;
        this.person.firstName = this.personFirstName;
        this.person.secondName = this.personMidName;
        this.person.lastName = this.personLastName;
        this.person.dateOfBirth = this.dateOfBirth;
        this.person.gender = this.personGender;
        this.member.id = this.memberId;
        this.member.personId = this.personId;
        this.member.dateofhire = this.saveFormatString(this.empInfoFormOne.controls['hireDate'].value);
        this.member.orgId = this.selectedMemberDivisionId;
        this.member.planMemberBenefitStatus = this.empInfoFormOne.controls['memberBenefitStatus'].value;
        //this.member.benefitEligibilityDate = this.saveFormatString(this.empInfoFormOne.controls['benefitEffDate'].value);
        this.member.benefitEligibilityDate = this.empInfoFormOne.controls['benefitEffDate'].value ? this.saveFormatString(this.empInfoFormOne.controls['benefitEffDate'].value) : null;

        this.member.orgPlanMemberNumber = this.empInfoFormOne.controls['memberNumber'].value;
        this.memberPerson.entityType = 1;
        this.memberPerson.person = this.person;
        this.memberPerson.personAddress = null;
        this.memberPerson.personEmail = null;
        this.memberPerson.personPhone = null;
        this.memberPerson.member = this.member;
      
        // this.memberDirectBilling.id = this.memberDirectBilling.id;
        // this.memberDirectBilling.directBillingInfoId = this.memberDirectBilling.directBillingInfoId;
        // this.memberDirectBilling.statusEffectiveDate = this.memberDirectBilling.statusEffectiveDate;
        // this.memberPerson.directBillingInformation = this.memberDirectBilling;

        //this.memberPerson.memberCharacteristic = null;
        let OccupationValue = this.empInfoFormOne.controls['occupation'].value;
        if (OccupationValue != null) {
            if (this.memberCharcter == null) {
                this.memberCharcter = new CreateOrEditMemberBenefitCharacteristicDto();
            }
            this.memberCharcter.value = OccupationValue;
            /// There are no required of child lookup but due to model requirements, passing default value -999
            this.memberCharcter.characteristicType = -999;
            this.memberCharcter.id = this.memberOccupationId;
            let itemClass = new KeyValuePairDto();
            itemClass.key = AppConsts.lookupKeys.Occupation;
            itemClass.value = OccupationValue.toString();
            this.memberCharacteristicList.push(itemClass);
            this.memberPerson.memberCharacteristicList = this.memberCharacteristicList;
        } else {
            this.memberCharcter = null;
        }
        this.memberPerson.memberCharacteristic = this.memberCharcter;
        let certificate = this.empInfoFormOne.controls['CertificateNumber'].value;
        if (certificate) {
            this.memberAltCertificate = new CreateOrEditMemberIdsDto();
            this.memberAltCertificate.id = this.memberCertificateId;
            this.memberAltCertificate.memberAltId = certificate;
            //this.memberAltCertificate.memberAltIdStartDate = this.saveFormatString(this.empInfoFormOne.get('CertificateNumberDate').value);
        }
        else if (this.memberCertificateId > 0) {
            this.memberAltCertificate = new CreateOrEditMemberIdsDto();
            this.memberAltCertificate.id = this.memberCertificateId;
            this.memberAltCertificate.memberAltId = certificate;
        }
        else {
            this.memberAltCertificate = null;

        }
        this.memberDetails.orgPlanMemberNumber = this.member.orgPlanMemberNumber;
        this.memberDetails.dateofhire = this.formateDate(this.member.dateofhire);
        this.memberDetails.benefitEligibilityDate = this.formateDate(this.member.benefitEligibilityDate);
        this.memberDetails.planMemberBenefitStatus = this.member.planMemberBenefitStatus;
            this.memberPerson.memberAlternateCertificate = this.memberAltCertificate;
            this.memberPerson.orgId = this.orgPlansonsorId;
        this._membersServiceProxy.createOrEditMemberPerson(false, this.memberPerson)
            .pipe(finalize(() => { this.submitted = false; }))
            .subscribe(result => {
                this.notify.info(this.l('MemberEmployInfoUpdateSuccess'));
                this.isDirty = false;
                //this.empInfoFormOne.reset(); 
                this.createOrEditMemberDetails.emit(this.memberDetails);
                this.getMemberForEdit();
                this.markFormAsPristineUnTouched();

                this.saving = false;
            },
                error => {
                    this.saving = false;
                });

    }

    changeDetectionForm() {

        this.empInfoFormOne.valueChanges.subscribe(val => {
            this.isDirty = this.empInfoFormOne.dirty;
        });

    }

    markFormAsPristineUnTouched() {
        Object.keys(this.empInfoFormOne.controls).forEach((key) => {
            const control = this.empInfoFormOne.controls[key];
            control.markAsPristine();
            control.markAsUntouched();
        });

    }

    setDivisionName(id: number, _divisionCode:string,_divisionName:string, event?: CreateOrEditMemberDivisionDto) {
        this.isDirty = false;
        this.markFormAsPristineUnTouched();
        if (event != null) {
            id = event.divisionorgid;
            this.empInfoFormOne.controls.divisionEffDate.patchValue(event.startDate);
            this.empInfoFormOne.controls.memberCriticalChangeDate.patchValue(event.startDate);
            _divisionCode=event.organizationCode;
            _divisionName=event.organizationName;
        }
        /* commented on 18th Sept 2024 K*C
        if (this.ddnDivisions.find(x => x.organizationId == id)) {
            this.memberdivisionName = this.ddnDivisions.find(x => x.organizationId == id).organizationName;
            this.selectedMemberDivisionId = id;
            this.memberOrganisationDetails.DivisionCode = this.ddnDivisions.find(x => x.organizationId == id).organizationCode;
            this.memberOrganisationDetails.DivisionName = this.memberdivisionName;
            if (event != null) {
                this.memberDivisionChangeOuput.DivisionCode = this.memberOrganisationDetails.DivisionCode;
                this.memberDivisionChangeOuput.DivisionName = this.memberdivisionName;
                this.memberDivisionChangeOuput.DivisionOrgid = id;
                this.divisionChangeEvent.emit(this.memberDivisionChangeOuput);
            }

        } else {
            this.memberdivisionName = ' ';
        }
        */

        if (id !=0) {
            this.memberdivisionName = _divisionName; //this.ddnDivisions.find(x => x.organizationId == id).organizationName;
            this.selectedMemberDivisionId = id;
            this.memberOrganisationDetails.DivisionCode =_divisionCode; // this.ddnDivisions.find(x => x.organizationId == id).organizationCode;
            this.memberOrganisationDetails.DivisionName = this.memberdivisionName;
            if (event != null) {
                this.memberDivisionChangeOuput.DivisionCode = this.memberOrganisationDetails.DivisionCode;
                this.memberDivisionChangeOuput.DivisionName = this.memberdivisionName;
                this.memberDivisionChangeOuput.DivisionOrgid = id;
                this.divisionChangeEvent.emit(this.memberDivisionChangeOuput);
            }

        } else {
            this.memberdivisionName = ' ';
        }
    }

    //Cost Center event trigger
    setCostCenterName(id: number, event?: CreateOrEditMemberCostCenter) {
        this.isDirty = false;
        this.markFormAsPristineUnTouched();
        if (event != null) {
            id = event.id;
            this.empInfoFormOne.controls.costCenterEffDate.patchValue(event.effectivedate);
            this.membercostCenterName = event.costCenter;
            this.memberOrganisationDetails.CostCenterName = this.membercostCenterName;
            this.plansponsorCostCenterId = event.plansponsorcostcenterid;
            this.costCenterChangeEvent.emit(event);
        }
        else {
            this.membercostCenterName = this.memberEditCostCenterName;
            this.selectedMemberCostCenterId = id;
            this.memberOrganisationDetails.CostCenterName = this.membercostCenterName;

        }
    }

    //MemberDirectBilling

    setMemberDirectBilling(id: number, event?: CreateOrEditDirectBillingInformation) {

        this.isDirty = false;
        this.markFormAsPristineUnTouched();
        if (event != null) {
            id = event.id;
            this.empInfoFormOne.controls.billingIndicator.patchValue(event.memberDirectBillingInfo);
            this.memberDirectBilling.memberDirectBillingInfo = event.memberDirectBillingInfo;
            this.billingIndicator = event.memberDirectBillingInfo;
            this.empInfoFormOne.controls.billingIndicatorEffectiveDate.patchValue(this.formateDate(event.statusEffectiveDate));
            this.directBillingInformationChangeEvent.emit(event);
            this.billingIndicatorId = event.id;
        }
        else {
            this.billingIndicator = this.memberDirectBilling.memberDirectBillingInfo;
            this.billingIndicatorId = this.memberDirectBilling.id;
            this.directBillingInformationChangeEvent.emit(event);
        }
    }

    setClassName(id: number,_classCode:string,_displayName:string, event?: CreateOrEditMemberClassEnrollmentDto) {
        
        this.isDirty = false;
        this.markFormAsPristineUnTouched();
        //let _classCode:string,_displayName:string;
        if (event != null) {
            id = event.planSponsorMemberClassId;
            this.empInfoFormOne.controls.classEffDate.patchValue(event.effectivedate);
             this.empInfoFormOne.controls.memberCriticalChangeDate.patchValue(event.effectivedate);
            _classCode=event.classCode;
            _displayName=event.displayName;
        }
        // commented below code to set value from emitter rather than dropdown on 17th Sept 2024
        /*
        if (this.ddlMemberClass.find(x => x.id == id)) {
            this.memberclassName = this.ddlMemberClass.find(x => x.id == id).displayName;
            this.selectedMemberClassId = id;
            this.memberOrganisationDetails.MemberClassCode = this.ddlMemberClass.find(x => x.id == id).classCode;
            this.memberOrganisationDetails.MemberClassName = this.memberclassName;
            if (event != null) {
                this.memberClassChangeOutput.planSponsorMemberClassId = id;
                this.memberClassChangeOutput.MemberClassCode = this.memberOrganisationDetails.MemberClassCode;
                this.memberClassChangeOutput.MemberClassName = this.memberclassName;
                this.classChangeEvent.emit(this.memberClassChangeOutput);

            }
        } else {
            this.memberclassName = ' ';
        }
        */
        if (id != 0) {
            this.memberclassName = _displayName; //this.ddlMemberClass.find(x => x.id == id).displayName;
            this.selectedMemberClassId = id;
            this.memberOrganisationDetails.MemberClassCode = _classCode; //this.ddlMemberClass.find(x => x.id == id).classCode;
            this.memberOrganisationDetails.MemberClassName = this.memberclassName;
            if (event != null) {
                this.memberClassChangeOutput.planSponsorMemberClassId = id;
                this.memberClassChangeOutput.MemberClassCode = this.memberOrganisationDetails.MemberClassCode;
                this.memberClassChangeOutput.MemberClassName = this.memberclassName;
                this.classChangeEvent.emit(this.memberClassChangeOutput);

            }
        } else {
            this.memberclassName = ' ';
        }
    }
    setStatusName(id: number, event?: any) {
        if (event != undefined && event.memberStatus != null) {
            let memberCurrentStatusDate = moment(this.saveFormatString(this.empInfoFormOne.get('statusChangeDate').value));
            let memberNewStatusDate = moment(event.memberStatus.sinceDate);

            if (event.memberStatus.isRehire && event.isTerminateToActiveChange == true && memberNewStatusDate > memberCurrentStatusDate){
                if(this.isGranted('Customs.CanOverrideMemberEffectiveDate')){
                    this.onChangeHireDateOrBenefitEffectiveDate(event.isTerminateToActiveChange, memberNewStatusDate);
                }
            }
            else {
                id = event.memberStatus.characteristicType;
                this.empInfoFormOne.controls.statusChangeDate.patchValue(this.formateDate(event.memberStatus.sinceDate));
                let memberstatusName = '';

                if (this.planMemberStatus.find(x => x.value == id)) {
                    memberstatusName = this.planMemberStatus.find(x => x.value == id).internalEntryName;
                    this.statusChangeDate = this.formateDate(event.memberStatus.sinceDate);
                }

                if (event.memberStatus.isRehire && event.isTerminateToActiveChange == true) {
                    this.empInfoFormOne.controls.benefitEffDate.patchValue(event.memberStatus.sinceDate);
                    this.empInfoFormOne.controls.divisionEffDate.patchValue(event.memberStatus.sinceDate);
                    this.empInfoFormOne.controls.classEffDate.patchValue(event.memberStatus.sinceDate);
                    this.reloadMemberSalaryPanel = (this.reloadMemberSalaryPanel === "") ? "reload" : "";
                    this.message.confirm(this.l('ReviewDependentsAfterAct'), '',
                        (isConfirmed) => {
                            let isStatus = isConfirmed;
                            if (isStatus == true) {
                                this.markFormAsPristineUnTouched();
                                $('.navi-item').removeClass('active');
                                $('.dependent').addClass('active');
                                //this.showcontent('dependent');
                            }
                        },
                        this.options
                    );
                }
                this.memberStatusChangeEvent.emit(event);  
            }
        }
        if (this.planMemberStatus && id != 0) {
            this.isDirty = false;
            this.markFormAsPristineUnTouched();
            if (this.planMemberStatus.find(x => x.value == id)) {
                this.memberstatusName = this.planMemberStatus.find(x => x.value == id).text;
                this.selectedMemberStatusId = id;
                this.memberstatusNameKey = this.planMemberStatus.find(x => x.value == id).internalEntryName;
            } else {
                this.memberstatusName = ' ';
            }
        }
    }

    createeditMemberEntity(entitytyp): void {

        let hireDate = this.saveFormatString(this.empInfoFormOne.get('hireDate').value);

        switch (entitytyp) {
            case 'class': {
                this.createOrEditMemberclassModal.show(this.memberId, this.orgId, this.selectedMemberClassId, hireDate);
                break;
            }
            case 'division': {
                this.createOrEditMemberDivisionModal.show(this.memberId, this.orgId, this.selectedMemberDivisionId, hireDate);
                break;
            }
            case 'status': {
                this.createOrEditMemberStatusModal.show(this.memberId, this.orgId, this.selectedMemberStatusId, hireDate);
                break;
            }
            case 'costCenter': {
                this.createorEditMemberCostCenterModal.show(this.memberId, this.orgId, this.orgPlansonsorId, this.plansponsorCostCenterId, hireDate, this.membercostCenterName, this.IsCostcenterDisable);
                break;
            }

        }
    }

    // showBillingModal(): void {
    //     this.createEditMemberDirectBillingInfoModal.show();
    // }

    setChangeStatusDate(statusDate: string) {
        this.statusChangeDate = statusDate;
    }

    userPermission() {

        this.isEmploymentInfoReadOnlyAccess = this.isGranted('Pages.Member.EmploymentInfo.View');
        this.isEmploymentInfoEditAccess = this.isGranted('Pages.Member.EmploymentInfo.Edit');
        this.hasEditAccess = this.isGranted('Pages.Members.Edit');
        let canEditMemberNumber = this.isGranted("Customs.CanEditMemberNumber.Allow");

        if (this.isEmploymentInfoReadOnlyAccess && !this.isEmploymentInfoEditAccess && !this.hasEditAccess) {
            this.empInfoFormOne.disable();
        }
        if (this.isEmploymentInfoEditAccess && this.hasEditAccess) {
            this.empInfoFormOne.enable();
            if (canEditMemberNumber) {
                this.empInfoFormOne.get('memberNumber').enable();
            }
            else {
                this.empInfoFormOne.get('memberNumber').disable();
            }
        }
    }

    clearValidation(): void {
        this.isMemberNumberExist = false;
    }

    onChangeMemberAltNumberEvent(event: any) {
        this.currentMemberAltNumber = event.target.value;
        if (this.currentMemberAltNumber !== '' && this.currentMemberAltNumber !== undefined) {
            if (this.memberAltNumber.toLowerCase() === this.currentMemberAltNumber.toLowerCase()) {
                this.empInfoFormOne.get('CertificateNumber').clearValidators();
                this.empInfoFormOne.get('CertificateNumber').updateValueAndValidity();
            }
            else {
                //this.empInfoFormOne.get('CertificateNumberDate').setValidators([Validators.required]);
                //this.empInfoFormOne.get('CertificateNumberDate').updateValueAndValidity();
                this.empInfoFormOne.get('CertificateNumber').setValidators([this.validateMemberAltNumberViaServer.bind(this)]);
                this.empInfoFormOne.get('CertificateNumber').updateValueAndValidity();
            }
        }
        /* else {
            this.empInfoFormOne.get('CertificateNumberDate').clearValidators();
            this.empInfoFormOne.get('CertificateNumberDate').updateValueAndValidity();
        } */
    }
    validateMemberAltNumberViaServer({ value }: AbstractControl) {
        this.isSpinner = true;
        this._membersServiceProxy
            .isMemberAlterNateNumberUnique(value, 0, this.memberId)
            .pipe(debounceTime(1000))
            .subscribe((isAltNumberFound) => {
                this.isSpinner = false;
                const control = this.empInfoFormOne.controls['CertificateNumber'];
                if (isAltNumberFound) {
                    control.setErrors({ errorUniqueMemberAltNumber: true });
                } else {
                    control.setErrors(null);
                }
                // else if(users==false){
                // control.setErrors(null);
                //   }
            });
    }
    onbenefitEffDateDateChange() {
        this.empInfoFormOne.patchValue({
            benefitEffDate: ''
        });

    }
    validateMemberNumberLength() {
        let memberNumberControl = this.empInfoFormOne.get('memberNumber');
        if (memberNumberControl.value) {
            memberNumberControl.setValue(memberNumberControl.value.trim());
        }
        memberNumberControl.setValidators(Validators.minLength(1));
        memberNumberControl.updateValueAndValidity();
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


    showFieldHistory2(fieldName: string, category: string, isLookUp?: boolean): void {

        let obj = {
            entityTypeFullName: 'SEB.FPE.Members.MemberBenefitCharacteristic',
            entityId: '0',
            propertyName: fieldName,
            displayName: fieldName,
            isLookUp: (isLookUp == undefined) ? false : isLookUp
        };
        if (category == 'smoker') {
            obj.entityId = this.memberSmokerId?.toString();
            this.fieldTypeHistoryModal.historyFieldName = this.l('Smokerstatus');
        } else if (category == 'marital') {
            obj.entityId = this.memberMaritalStatusId?.toString();
            this.fieldTypeHistoryModal.historyFieldName = this.l('MaritalStatus');
        } else if (category == 'firstnation') {
            obj.entityId = this.firstNationStatusId?.toString();
            this.fieldTypeHistoryModal.historyFieldName = this.l('FirstNationStatus');
        } else if (category == 'occupation') {
            obj.entityId = this.memberOccupationId?.toString();
            this.fieldTypeHistoryModal.historyFieldName = this.l('Occupation');
        }
        this.fieldTypeHistoryModal.show(obj);
    }
    get isAdministrator() {
        return this.userRoleGroup === AppConsts.lookupKeys.Administrator ? true : false
    }

    extendNewhireWindow() {
        this.extendingNewHire = true;
        this.message.confirm(
            this.l('ExtendNewHireWindowDaysConfirmation'),
            ' ',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._membersServiceProxy.extendNewhireWindow(this.memberId)
                        .subscribe((result) => {
                            this.extendingNewHire = false;
                            this.notify.info(this.l('NewHireWindowExtended'));
                            this.getMemberForEdit();
                        }, (error) => this.apiError(
                        ));
                }
                else {
                    this.extendingNewHire = false;;
                    return;
                }
            }
        );
    }

    fillSubKeysData() {
        this.AddLookUpKeys(AppConsts.lookupKeys.OrganizationSetting, AppConsts.lookupKeys.CostCenter);
        this.AddLookUpKeys(AppConsts.lookupKeys.costCenterStatus, AppConsts.CostCenterStatusType.active);
        this.AddLookUpKeys(AppConsts.lookupKeys.costCenterStatus, AppConsts.CostCenterStatusType.terminated);
        this._commonLookupServiceProxy.getLookupSubTypesValues(this.lookUpInputs).subscribe(result => {
            this.lookUpSubkeys = result.items;
            this.getRecordBySubKey();
        });
    }
    getRecordBySubKey() {
        this.costCenter.settingName = this.getLookUpSubKeyId(AppConsts.lookupKeys.OrganizationSetting, AppConsts.lookupKeys.CostCenter);
    }

    AddLookUpKeys(_parentKey: string, _childKey: string) {
        let k = new LookUpInputDto();
        k.childKey = _childKey;
        k.parentKey = _parentKey;
        this.lookUpInputs.push(k);
    }
    getLookUpSubKeyId(_parentKey, _childKey) {
        return this.lookUpSubkeys.find(c => c.text === _childKey && c.tooltip === _parentKey).value;
    }
    getOrganizations(organizationId?: number) {
        this._organizationsServiceProxy
            .getOrganizationWizardForEdit(organizationId, '')
            .subscribe((result) => {
                this.getOrganizationSettingModel(result);
            },
                error => {
                    this.apiError();
                }
            );
    }
    getOrganizationSettingModel(result: any) {
        result.organizationSetting.forEach(element => {
            //Cost center
            if (this.costCenter.settingName === element.settingName) {
                if (element.settingValueText.toUpperCase() === 'YES') {
                    this.IsCostcenterDisable = false;
                }
                else {
                    this.IsCostcenterDisable = true;
                }
                this.costCenter.settingValueText = element.settingValueText;
                this.costCenter.id = element.id;
                this.costCenter.organizationId = element.organizationId;
            }
            else {
                this.IsCostcenterDisable = true;
            }
        });
    }
changeCriticalDate(){
    var currentDate =  this.saveFormatString(this.empInfoFormOne.controls['memberCriticalChangeDate'].value);
    this.changechangecriticalchangeDateModal.show();
}
onChangecriticalDateClose(event:string){
   
this.empInfoFormOne.controls.memberCriticalChangeDate.patchValue(event);
}
    onChangeHireDateOrBenefitEffectiveDate(isTerminateToActiveChange? : boolean, newBenefitEffectiveDate?: any): void {
        const hireDate = this.saveFormatString(this.empInfoFormOne.get('hireDate').value);
        const benefitEffectiveDate = this.saveFormatString(this.empInfoFormOne.get('benefitEffDate').value);
        
        const MemberFullName = `${this.personFirstName} ${this.personMidName ? this.personMidName + ' ' : ''}${this.personLastName}`;
        const orgPlanMemberNumber = this.empInfoFormOne.controls['memberNumber'].value;
    
        // Using object to pass parameters
        this.changeHireDateOrBenefitEffectiveDateModal.show({
            memberId: this.memberId,
            hireDate,
            benefitEffectiveDate,
            memberFullName: MemberFullName,
            orgPlanMemberNumber,
            divisionId:this.selectedMemberDivisionId,
            selectedMemberClassId:this.selectedMemberClassId,
            isTerminateToActiveChange,
            newBenefitEffectiveDate
        });
    }
    
    reloadSalaryPanel = true;
    onChangeHireDateModalClose(): void {
        this.reloadSalaryPanel = false; 
            setTimeout(() => {
                this.reloadSalaryPanel = true;
              
            },0);
            this.getMemberForEdit(); 
      }
    onDateChange(newDate: any) {
        if (this._sessionStorageHelper.getSecureSessionStorage(AppConsts.sessionkey.TPAAdminRetrodatelimitApplicable) != undefined) {
          let isApplicable = Boolean(this._sessionStorageHelper.getSecureSessionStorage(AppConsts.sessionkey.TPAAdminRetrodatelimitApplicable));
          this.prevHireDate = this.prevHireDate ??  this.empInfoFormOne.controls.hireDate.value;
          if (isApplicable && !(newDate == this.prevHireDate)) {
            this._commonLookupServiceProxy.tpaVerifyMaximumDate(this.formateDate(newDate)).subscribe(result => {
              if (!result) {
                this.message.warn(this.l('EffectiveDateBeyondLimit')).then(() => {
                  this.empInfoFormOne.controls.hireDate.patchValue('');
                });
              }
            }, (error) => this.apiError());
          }
        }
      }
}


