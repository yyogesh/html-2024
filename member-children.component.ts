import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AppConsts } from '../../../../../shared/utilities/AppConsts';
import { CommonService } from '../../../../../shared/services/common.service';
import { MemberDependentService } from '../../services/member-dependent.service';
import { transformResult } from '../../../../../shared/utilities/service.extensions';
import { finalize, takeUntil } from 'rxjs/operators';
import { IChildLookup } from '../../../../../shared/models/lookup.model';
import { Subject, forkJoin } from 'rxjs';
import { CreateOrEditPersonDto } from '../../services/model/CreateOrEditPersonDto';
import { CreateOrEditMemberDependentDto } from '../../services/model/CreateOrEditMemberDependentDto';
import { CreateOrEditMemberRelationshipCharacteristicDto } from '../../services/model/CreateOrEditMemberRelationshipCharacteristicDto';
import { formatter } from '../../../../../shared/utilities/formatter';
import { comparator } from '../../../../../shared/utilities/comparator';
import { DropDownOption } from '../../../../../shared/models/dropdown-option';
import { CreateOrEditMemberActionRequiredDto } from '../../services/model/CreateOrEditMemberActionRequiredDto';
import { IPendingActionStudentCertificationDto } from '../../services/interface/IPendingActionStudentCertificationDto';
import { IGetMemberDependentForViewDto } from '../../services/interface/IGetMemberDependentForViewDto';
import { IGetMemberForEditOutput } from '../../services/interface/IGetMemberForEditOutput';
import { ENROLMENTTYPE } from '../../../../../shared/constants/enrolment-type';
import { MemberProfileService } from '../../services/member-profile.service';
import { ITranslation } from '../../../../../shared/models/translation.model';
import { SessionStorageHelper } from '../../../../../shared/helpers/SessionStorage.helper';
import { noWhitespaceValidator } from '../../../../../shared/validators/whitespace.validator';
import { IdeleteDependentModel } from '../../services/model/deleteDependent.model';
import { CreateOrEditChildDependentDto } from '../../services/model/CreateOrEditChildDependentDto';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { RESOURCE } from '../../../../../shared/constants/resource';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ROUTE } from '../../../../../shared/constants/route-path';
import { SESSIONKEY } from '../../../../../shared/constants/session-key';
import { MenuService } from '../../../../../shared/services/menu.service';

@Component({
  selector: 'app-member-children',
  templateUrl: './member-children.component.html',
  styleUrl: './member-children.component.scss'
})
export class MemberChildrenComponent {

  @Input() memberid: number;
  @Input() memberPersonData: IGetMemberForEditOutput;
  @Input() enrolmentType: string;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
  @Input() isBack: boolean = false;
  @Input() province: any;
  @Input() benefitEffectiveDate: Date;
  @Input() InfoChildData: any;
  @Input() stepStatus: boolean;
  @Input() isEnrolmentTypeLE: boolean;
  @Input() isEditModeLE: boolean;
  private isLookupInitialized = false;
  private isLookupInitializedNonLE = false;
  private appSession: SessionStorageHelper;
  MultipleResultData: any;
  maritalStatus: IChildLookup[];
  gender: IChildLookup[];
  relationshipCategory: number;
  relationshipType: IChildLookup[];
  memberRelationshipCharacteristicType: IChildLookup[];
  memberRelationshipCharacteristicDataType: IChildLookup[];
  reasons: IChildLookup[];
  reasonForChild: IChildLookup[];
  childAgeLimit: number;
  studentAgeLimit: number;
  studentAgeLimitQC: number;
  childUpperAgeDays: number;
  memberEligibilityDate: string;
  genderDropdown: DropDownOption;
  genderDropdownArray: any = [] as any;
  memberDependentForViewDto: IGetMemberDependentForViewDto[] = [];
  person: CreateOrEditPersonDto = new CreateOrEditPersonDto();
  dependent: CreateOrEditMemberDependentDto = new CreateOrEditMemberDependentDto();
  deletedependentId: number = 0;
  deletedependentEffectiveDate: string = "";
  deleteformIndex: number = -1;
  memberRelationshipCharacteristicList: CreateOrEditMemberRelationshipCharacteristicDto[] = [];
  dependentDetails: CreateOrEditChildDependentDto;
  dependentDetailsArray: CreateOrEditChildDependentDto[] = [];
  memberActionRequiredDto: CreateOrEditMemberActionRequiredDto;
  dataStudentCertification: IPendingActionStudentCertificationDto[] = [];
  public createOrEditMemberActionRequiredDtos: any[] = [];
  _relationshipToPersonId: number;
  activeRelationshipType: string = '';
  //memberProvince: string;
  dynamicForm: FormGroup;
  selectedOption: string = '';
  stop$ = new Subject<void>();
  _boolChildrenAvailable: boolean = false;
  isChildrenAvailable: string = "0";
  isStudent: boolean = false;
  isChildAboveStudentAge = false;
  isChildAboveStudentAgeQC = false;
  isChildbelowStudentAge = false;
  isChildUpdated = false;
  studentCertficationArray: any = [];
  isNoChild = false;
  alertText: string;
  openAlertModal: boolean;
  confirmModalIsOpen: boolean = false;
  confirmalertTitle: string;
  confirmalertText: string;
  isEditMode: boolean = false;
  maxlength: number = 35;
  childAgeValidationMessage: string;
  currenctyear = new Date().getFullYear();
  dependentDeleteModel: IdeleteDependentModel;
  ArraydependentDeleteModel: IdeleteDependentModel[] = [];
  isChildexistsinBulk: boolean = false;
  _selectedLanguage: any;
  translate: ITranslation;
  initialFormValues: any;
  hasChanged = false;
  selectedReasonId: number | undefined;
  isBenefitEffectiveDateChanged: boolean = false;
  isChildDobAvailable: boolean;
  LEChildUpdationId: string = '';
  isDependentLoaded: boolean = false;

  constructor(private commonService: CommonService,
    private memberDependentService: MemberDependentService,
    private _formatter: formatter,
    private _compare: comparator,
    private fb: FormBuilder,
    injector: Injector,
    private _profileService: MemberProfileService,
    private _translationService: TranslationService,
    private router: Router,
    private route: ActivatedRoute,
    private menuService: MenuService
  ) {
    this.appSession = injector.get(SessionStorageHelper);
    this.dynamicForm = this.fb.group({
      dynamicFields: this.fb.array([]), // Initialize form array
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.LEChildUpdationId = p['id'];
    })
    this._translationService.currentLanguage.pipe(takeUntil(this.stop$)).subscribe(value => {
      this._translationService.getComponentWiseTranslation(RESOURCE.PROFILE).pipe(takeUntil(this.stop$)).subscribe({
        next: (data) => {
          this.translate = this._translationService.convertTranslation(value, data);
          this._selectedLanguage = value == "fr" ? "fr" : "en";
          this.bindLookupItems();
        }
      });
    });
    setTimeout(() => {
      const el = document.getElementById('radioAccMember');
      el?.focus();
    }, 500);
  }
  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value != null && control.value != undefined) {
        const today = new Date();
        const dateOfBirth = new Date(control.value);
        return dateOfBirth > today ? { 'futureDate': { value: control.value } } : null;
      }
      return null;
    };
  }

  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value != null && control.value != undefined) {
        const today = new Date();
        const studyEndDate = new Date(control.value);
        return studyEndDate < today ? { 'pastDate': { value: control.value } } : null;
      }
      return null;
    };
  }

  studentAgeLimitValidation(index: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!this.childAgeLimit || !this.studentAgeLimit || !this.studentAgeLimitQC) {
        return null;
      }
      if (this.childAgeLimit > 0 && control.value != null && control.value != undefined && control.value != "") {
        const dateOfBirth = new Date(control.value);
        const childagelimit = this._compare.calculateDateOfBirthFromAge(this.childAgeLimit);
        let backStudentDate: any;
        this.childAgeValidationMessage = this.translate['profile_MemberDependent_AdditionWarningMessage'].toString().replace('<#>', (index + 1).toString());
        if (this.province.trim().toUpperCase() === "QC") {
          backStudentDate = this.studentAgeLimitQC;
          this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(true);
          this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
        }
        else {
          backStudentDate = this.studentAgeLimit;
          this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(true);
          this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
        }
        const studentagelimit = this._compare.calculateDateOfBirthFromAge(backStudentDate);
        if (dateOfBirth < studentagelimit)
          return { 'studentAgelimit': { value: control.value } }
        if (dateOfBirth > studentagelimit && dateOfBirth > childagelimit) {
          this.openSchoolSection(false, index);
          this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
          this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
        }
        return dateOfBirth < studentagelimit ? { 'studentAgelimit': { value: control.value } } : null;
      }
      return null;
    };
  }
  childAgeLimitValidation(index: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!this.childAgeLimit || !this.studentAgeLimit || !this.studentAgeLimitQC) {
        return null;
      }
      if (this.childAgeLimit > 0 && control.value != null && control.value != undefined && control.value != "") {
        this.childAgeValidationMessage = this.translate['profile_MemberDependent_AdditionWarningMessage'].toString().replace('<#>', (index + 1).toString());
        const currentDate = new Date();
        const dateOfBirth = new Date(control.value);
        const agelimit = this._compare.calculateDateOfBirthFromAge(this.childAgeLimit);
        const birthDate = new Date(this._formatter.formattedDate(dateOfBirth)).getFullYear();
        const backChildDate = this._compare.getPreviousYearDateFromCurrentDateByGivenYear(this.childAgeLimit);
        //return dateOfBirth < agelimit ? { 'childAgelimit': { value: control.value } } : null;
        //Case1- Child
        if (dateOfBirth <= agelimit) {
          //Case2- Student
          if (birthDate <= backChildDate) {
            this.childUpperAgeDays = this._compare.calculateDaysFromCurrentDate(new Date(backChildDate, currentDate.getMonth(), currentDate.getDate()));
            let dobdays = this._compare.calculateDaysFromCurrentDate(dateOfBirth);
            //Condition for adding student on the basis of their age
            let backStudentDate: any;
            if (this.province.trim().toUpperCase() === "QC") {
              backStudentDate = this._compare.getPreviousYearDateFromCurrentDateByGivenYear(this.studentAgeLimitQC);
              this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(true);
              this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
            }
            else {
              backStudentDate = this._compare.getPreviousYearDateFromCurrentDateByGivenYear(this.studentAgeLimit);
              this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
              this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(true);
            }
            let studentAgeLimitdays = this._compare.calculateDaysFromCurrentDate(new Date(backStudentDate, currentDate.getMonth(), currentDate.getDate()));
            // Check if child is under upper age or near upper age
            if (dobdays <= this.childUpperAgeDays && dobdays <= studentAgeLimitdays) {
              this.isChildbelowStudentAge = true;
              //this.dependent.relationshipType = this.getRelationShipType(false, false);
              this.dynamicFields.controls[index].get('inactivestudentchild')?.patchValue(true);
              this.dynamicFields.controls[index].get('inactivedisabledchild')?.patchValue(true);
            }
            // Check if child is beyond upper age but under student age
            if (dobdays >= this.childUpperAgeDays && dobdays <= studentAgeLimitdays) {
              //this.isChildAboveStudentAge = true;
              this.dynamicFields.controls[index].get('inactivestudentchild')?.patchValue(false);
              this.dynamicFields.controls[index].get('inactivedisabledchild')?.patchValue(false);
            }
            if (dobdays > this.childUpperAgeDays && dobdays > studentAgeLimitdays) {
              this.dynamicFields.controls[index].get('inactivestudentchild')?.patchValue(true);
              this.dynamicFields.controls[index].get('inactivedisabledchild')?.patchValue(false);
            }
          }
          else {
            this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
            this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
            this.dynamicFields.controls[index].get('student')?.patchValue(false);
            this.dynamicFields.controls[index].get('disabled')?.patchValue(false)
          }
          //Case3- Disabled-Overage
          return { 'childAgelimit': { value: control.value } }
        }
        else {
          // Chitransh Commented: Getting error sometimes 
          // this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
          // this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
          // this.dynamicFields.controls[index].get('inactivestudentchild')?.patchValue(true);
          // this.dynamicFields.controls[index].get('inactivedisabledchild')?.patchValue(true);
          const group = this.dynamicFields?.controls?.[index] as FormGroup;
          if (!group) return null;

          group.get('isChildAboveStudentAgeQC')?.patchValue(false);
          group.get('isChildAboveStudentAge')?.patchValue(false);
          group.get('inactivestudentchild')?.patchValue(true);
          group.get('inactivedisabledchild')?.patchValue(true);
        }
      }
      return null;
    };
  }
  disabledOverAgeLimitValidation(index: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!this.childAgeLimit || !this.studentAgeLimit || !this.studentAgeLimitQC) {
        return null;
      }
      if (this.childAgeLimit > 0 && control.value != null && control.value != undefined && control.value != "") {
        let _studentAgeLimit: any;
        if (this.province.trim().toUpperCase() === "QC") {
          _studentAgeLimit = this.studentAgeLimitQC;
        }
        else {
          _studentAgeLimit = this.studentAgeLimit;
        }
        const dateOfBirth = new Date(control.value);
        const childagelimit = this._compare.calculateDateOfBirthFromAge(_studentAgeLimit);
        if (dateOfBirth < childagelimit) {
          //this.checkdisabledchild(false, index, dateOfBirth);
          //this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
          //this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
          return { 'overAgechildAgelimit': { value: control.value } }
        }
      }
      return null;
    };
  }
  private bindLookupItems() {
    this.commonService.getBenefitSettingValue(AppConsts.benefitSettingType.ChildUpperAgeLimit, 0).pipe(takeUntil(this.stop$))
      .subscribe({
        next: (result) => {
          this.childAgeLimit = parseInt(transformResult(result, null));
        }
      })
    this.commonService.getBenefitSettingValue(AppConsts.benefitSettingType.StudentUpperAgeLimit, 0).pipe(takeUntil(this.stop$))
      .subscribe({
        next: (result) => {
          this.studentAgeLimit = parseInt(transformResult(result, null));
        }
      })
    this.commonService.getBenefitSettingValue(AppConsts.benefitSettingType.StudentUpperAgeLimitQC, 0).pipe(takeUntil(this.stop$))
      .subscribe({
        next: (result) => {
          this.studentAgeLimitQC = parseInt(transformResult(result, null));
        }
      })

    let lookupseachitems: any = [
      AppConsts.lookupKeys.gender,
      AppConsts.lookupKeys.relationshipCategory,
      AppConsts.lookupKeys.relationshipCharacteristicType,
      AppConsts.lookupKeys.settingDataType,
      AppConsts.lookupKeys.ReasonForChild
    ];
    this.commonService.getLookupDataByParent(lookupseachitems)
      .pipe(finalize(() => {
        // removed LE code from here
      }))
      .subscribe({
        next: (result) => {
          let _result = transformResult(result, null);
          this.MultipleResultData = _result;
          if (this.MultipleResultData != null && this.MultipleResultData.length > 0) {
            this.gender = this.MultipleResultData.filter((item: any) => item.parentInternalName == AppConsts.lookupKeys.gender)[0].childData;
            this.relationshipType = this.MultipleResultData.filter((item: any) => item.parentInternalName == AppConsts.lookupKeys.relationshipCategory)[0].childData;
            this.memberRelationshipCharacteristicType = this.MultipleResultData.filter((item: any) => item.parentInternalName == AppConsts.lookupKeys.relationshipCharacteristicType)[0].childData;
            this.memberRelationshipCharacteristicDataType = this.MultipleResultData.filter((item: any) => item.parentInternalName == AppConsts.lookupKeys.settingDataType)[0].childData;
            this.reasonForChild = this.MultipleResultData.filter((item: any) => item.parentInternalName == AppConsts.lookupKeys.ReasonForChild)[0].childData;
            this.genderDropdownArray = [];
            this.genderDropdown = new DropDownOption();
            this.genderDropdown.label = this.translate['common_select'].toString();
            this.genderDropdown.value = '';
            this.genderDropdownArray.push(this.genderDropdown);
            for (let item of this.gender) {
              this.genderDropdown = new DropDownOption();
              this.genderDropdown.label = item.childName || '';
              this.genderDropdown.value = item.childLookUpId || '';
              this.genderDropdownArray!.push(this.genderDropdown);
            }
          }
          if (this.isEnrolmentTypeLE && !this.isEditModeLE) {
            if (this.isLookupInitialized) {
              this.removeLastChildField();
            }
            this.addNewField(0);
            this.isChildrenAvailable = '1';
            this.onOptionChange('1');
            const storedReasonId = sessionStorage.getItem(SESSIONKEY.REASONFORCHILD);
            if (storedReasonId !== null) {
              this.selectedReasonId = Number(storedReasonId);
            }
            this.isLookupInitialized = true;
          }
          else {
            if (!this.isDependentLoaded) {
              this.isDependentLoaded = true;
              this.getDependentInformation(AppConsts.dependentType.child);
            }
          }
        }
      });
    this.commonService.getLookupDataByParentName(AppConsts.lookupKeys.relationshipCategory).subscribe({
      next: (result) => {
        let _result = transformResult(result, null);
        if (_result != null && _result.length > 0) {
          this.relationshipCategory = _result[0].parentLookUpId;
        }
      }
    });
    //// commented below code to fix UAT 30/07/2025
    // this.memberEligibilityDate = this.commonService.getEnrollmentDate(this.memberid || 0);
    this.memberEligibilityDate = this._formatter.dateformat(this.benefitEffectiveDate);
  }

  get dynamicFields(): FormArray {
    return this.dynamicForm.get('dynamicFields') as FormArray;
  }

  public addNewField(index: number) {
    if (index == 0 && this.dynamicFields !== undefined && this.dynamicFields.length > 0) {
      index = this.dynamicFields.length;
    }
    this.isChildDobAvailable = sessionStorage.getItem(SESSIONKEY.CHILDDOB) === 'true';

    const preSelectedDob = this.isChildDobAvailable
      ? this._formatter.dateformat(this.benefitEffectiveDate): '';
    const fieldGroup = this.fb.group({
      id: [null],
      relationshipCategory: [this.relationshipCategory],
      relationshipType: [this.relationshipType.find(y => y.childInternalName == AppConsts.relationShipType.child)?.childLookUpId, [Validators.required]],
      firstName: ['', [Validators.required, Validators.maxLength(100), noWhitespaceValidator()]],
      midName: [''],
      lastName: ['', [Validators.required, Validators.maxLength(100), noWhitespaceValidator()]],
      dateOfBirth: [preSelectedDob, [Validators.required, this.futureDateValidator(), this.childAgeLimitValidation(index).bind(this), this.disabledOverAgeLimitValidation(index).bind(this)]],
      startDate: [this._formatter.getValidDateString(this.memberEligibilityDate), [Validators.required]],
      gender: ['', [Validators.required]],
      smoker: [''],
      schoolName: [''],
      reason: [this.bindReasonOnCreate(), [Validators.required]],
      eventDate: [this._formatter.getValidDateString(this.memberEligibilityDate)],
      studyendDate: [''],
      relationshipToPersonId: [0],
      endDate: [''],
      student: [null],
      disabled: [null],
      inactivestudentchild: [true],
      inactivedisabledchild: [true],
      isChildUpdated: [false],
      isChildAboveStudentAge: [false],
      isChildAboveStudentAgeQC: [false],
      isReadOnly: [false],
      reasonForChild: ['']
    });
    if (this.isChildDobAvailable) {
      fieldGroup.get('dateOfBirth')?.disable({ emitEvent: false });
    }
    this.dynamicFields.push(fieldGroup); // Add field to the array
  }

  public removeField(index: number, dependentId?: number, effectiveDate?: string) {
    if (dependentId != null) {
      this.isChildexistsinBulk = false;
      let currentchild = this.translate['profile_child'].toString();
      this.deletedependentId = dependentId;
      this.deletedependentEffectiveDate = effectiveDate || "";
      let studentchild = this.dynamicFields.controls[index].get('student')?.value;
      let disabledchild = this.dynamicFields.controls[index].get('disabled')?.value;
      if (studentchild != null)
        currentchild = this.translate['profile_childstudent'].toString();
      if (disabledchild != null)
        currentchild = this.translate['profile_childdisabled'].toString();
      this.deleteformIndex = index;
      // Dependent EffectiveDate
      const _dependentStartDate = this.dynamicFields.controls[index].get('startDate')?.value;
      let _dependenteffectiveDate = this._formatter.isDateOnly(_dependentStartDate) ? this._formatter.getISOdateString(_dependentStartDate) : _dependentStartDate;
      const _dependentEffectDate = new Date(_dependenteffectiveDate);
      // Enrolment EffectiveDate
      let _benefitEffectiveDate = new Date(this.benefitEffectiveDate);
      // Condition check before delete child
      const _conditionCheck: boolean = (_dependentEffectDate < _benefitEffectiveDate)
        && (this.enrolmentType == ENROLMENTTYPE.NEWHIRE || this.enrolmentType == ENROLMENTTYPE.ANNUAL)
        ? true : false;

      if (_conditionCheck) {
        this.confirmalertTitle = this.translate['profile_dependentDeleteMessagetitle'].toString().replace('<dependent>', currentchild);
        this.confirmalertText = this.translate['profile_userDeleteConfirm'].toString() + ' ' + this.translate['profile_dependentDeleteMessage'].toString().replace('<dependent>', currentchild);
        this.confirmModalIsOpen = true;
        return;
      }
      else {
        // No popup and direct soft delete
        this.handleDeleteConfirmation(true);
      }
      //this.deleteChildDependent(dependentId, effectiveDate);
    }
    else {
      this.dynamicFields.removeAt(index); // Remove field from the array
      // if no dependent left in list then set NO to radio button
      if (this.dynamicFields !== undefined && this.dynamicFields.length == 0) {
        this.isChildrenAvailable = "2";
        this.isNoChild = true;
        // Select the radio button by its ID
        const radioButton = document.getElementById("radioAccept2") as HTMLInputElement;
        // Check if it exists and mark it as selected
        if (radioButton) {
          radioButton.checked = true;
        }
      }


    }
  }
  private addDataField(dependentDto: IGetMemberDependentForViewDto[]) {
    let childStudentDependentId = 0;
    dependentDto.sort((a, b) => a.memberDependent.id - b.memberDependent.id).forEach((item: any, index: number) => {
      this.addNewField(index);
      let _eventDate = null;
      _eventDate = item.memberDependent.event_date == null ? null : this._formatter.dateformat(item.memberDependent.event_date);
      this.dynamicFields.controls[index].get('id')?.patchValue(item.memberDependent.id);
      this.dynamicFields.controls[index].get('relationshipCategory')?.patchValue(item.memberDependent.relationshipCategory);
      this.dynamicFields.controls[index].get('relationshipType')?.patchValue(item.memberDependent.relationshipType);
      this.dynamicFields.controls[index].get('firstName')?.patchValue(item.memberDependent.firstName);
      this.dynamicFields.controls[index].get('midName')?.patchValue(item.memberDependent.secondName);
      this.dynamicFields.controls[index].get('lastName')?.patchValue(item.memberDependent.lastName);
      this.dynamicFields.controls[index].get('dateOfBirth')?.patchValue(item.memberDependent.dateOfBirth);
      this.dynamicFields.controls[index].get('startDate')?.patchValue(item.memberDependent.effectiveDate);
      this.dynamicFields.controls[index].get('gender')?.patchValue(item.memberDependent.gender);
      this.dynamicFields.controls[index].get('schoolName')?.patchValue(item.memberDependent.schoolname);
      this.dynamicFields.controls[index].get('reason')?.patchValue(item.memberDependent.reason_id == null ? this.bindReasonOnEdit() : item.memberDependent.reason_id);
      this.dynamicFields.controls[index].get('endDate')?.patchValue(item.memberDependent.endDate);
      this.dynamicFields.controls[index].get('eventDate')?.patchValue(_eventDate);
      this.dynamicFields.controls[index].get('relationshipToPersonId')?.patchValue(item.memberDependent.relationshipToPersonId);
      this.dynamicFields.controls[index].get('student')?.patchValue(this.getChildType(item.memberDependent.relationshipType, AppConsts.relationShipType.student));
      this.dynamicFields.controls[index].get('disabled')?.patchValue(this.getChildType(item.memberDependent.relationshipType, AppConsts.relationShipType.disabled));
      this.dynamicFields.controls[index].get('inactivestudentchild')?.patchValue(this.getChildType(item.memberDependent.relationshipType, AppConsts.relationShipType.student) == true ? false : true);
      this.dynamicFields.controls[index].get('inactivedisabledchild')?.patchValue(this.getChildType(item.memberDependent.relationshipType, AppConsts.relationShipType.disabled) == true ? false : true);
      this.dynamicFields.controls[index].get('isChildUpdated')?.patchValue(true);
      this.dynamicFields.controls[index].get('isChildAboveStudentAge')?.patchValue(false);
      this.dynamicFields.controls[index].get('isChildAboveStudentAgeQC')?.patchValue(false);
      if (item.memberDependent.internalRelationshipName == AppConsts.relationShipType.student) {
        //this.dynamicFields.controls[index].get('studyendDate')?.patchValue(item.memberDependent.event_date);
        this.dynamicFields.controls[index].get('studyendDate')?.patchValue(_eventDate);
        childStudentDependentId = item.memberDependent.id;
        this.openSchoolSection(true, index);
      }
      if (item.memberDependent.internalRelationshipName == AppConsts.relationShipType.disabled) {
        this.checkdisabledchild(true, index, item.memberDependent.dateOfBirth);
      }
      if (this.isFormReadOnly(item.memberDependent.effectiveDate)) {
        this.setReadOnlyControls(index);
      }
    });
    //this.initialFormValues = this.dynamicForm.value;
  }

  private getChildType(_relationShipType: number, dependentType: string): any {
    let _childType = null;
    let _childDependentType = this.relationshipType.find(y => y.childLookUpId == _relationShipType)?.childInternalName || 0;
    if (_childDependentType == dependentType) {
      _childType = true;
    }
    return _childType;
  }

  onOptionChange(option: string) {
    this.selectedOption = option;
    if (this.selectedOption == '2') {
      this.isNoChild = true;
    }
    else {
      this.isNoChild = false;
      if (this.dynamicFields !== undefined && this.dynamicFields.length == 0) {
        this.addNewField(this.dynamicFields.length);
      }
    }
    this.reasons = this.reasonForChild;
  }

  private getDependentInformation(dependentType: string) {
    this.memberDependentService.getAllDependents(dependentType, this.memberid,
      0, this._formatter.dateformat(this.benefitEffectiveDate), '', 0, 1).pipe(takeUntil(this.stop$))
      .subscribe({
        next: (result) => {
          this.memberDependentForViewDto = transformResult(result, null);
          if (this.memberDependentForViewDto.length > 0) {
            if (this.LEChildUpdationId !== '' && this.LEChildUpdationId !== null && this.LEChildUpdationId !== undefined) {
              const dependentToUpdateDto = this.memberDependentForViewDto.find(x => x.memberDependent.id === parseInt(this.LEChildUpdationId));
              this.memberDependentForViewDto = [];
              this.memberDependentForViewDto.push(dependentToUpdateDto!);
            }
            if (!this.isLookupInitializedNonLE) {
              this._boolChildrenAvailable = true;
              this.isChildrenAvailable = "1";
              this.addDataField(this.memberDependentForViewDto);
              this.onOptionChange('1');
              this.isLookupInitializedNonLE = true;
            }
          }
          else {
            this._boolChildrenAvailable = false;
            if (this.enrolmentType == ENROLMENTTYPE.NEWHIRE) {
              this.isChildrenAvailable = "0";
              this.selectedOption = "2";
            }
            else {
              this.isChildrenAvailable = "2";
            }
            this.onOptionChange('2');
          }
        }
      })
  }

  private getStudentCertificaionData() {
    // Optimize: Make all API calls in parallel instead of sequentially
    if (!this.createOrEditMemberActionRequiredDtos || this.createOrEditMemberActionRequiredDtos.length === 0) {
      this.updateMemberAction();
      return;
    }

    const certificationRequests = this.createOrEditMemberActionRequiredDtos.map((memberAction: CreateOrEditMemberActionRequiredDto) => 
      this.memberDependentService.getPendingActionStudentCertificationByDependentId(memberAction.dependentId)
        .pipe(
          takeUntil(this.stop$)
        )
    );

    // Execute all requests in parallel using forkJoin
    forkJoin(certificationRequests).subscribe({
      next: (results: IPendingActionStudentCertificationDto[][]) => {
        results.forEach((result: IPendingActionStudentCertificationDto[], index: number) => {
          let _dataStudentCertification = transformResult(result, null);
          this.createOrEditMemberActionRequiredDtos[index].id = _dataStudentCertification[0]?.actionRequiredId || 0;
        });
        this.updateMemberAction();
      },
      error: (error: any) => {
        console.error('Error fetching student certification data:', error);
        // Still proceed with update even if some requests fail
        this.updateMemberAction();
      }
    });
  }

  openSchoolSection(checkedStatus: boolean, formIndex: number) {
    this.activeRelationshipType = this.isStudent ? AppConsts.relationShipType.student : AppConsts.relationShipType.child;
    if (checkedStatus) {
      let studyEndDate = this._formatter.saveFormatString(this.dynamicFields.controls[formIndex].get('studyendDate')?.value);
      this.isStudent = checkedStatus;
      this.dynamicFields.controls[formIndex].get('student')?.patchValue(checkedStatus);
      this.dynamicFields.controls[formIndex].get('disabled')?.patchValue(null);
      this.dynamicFields.controls[formIndex].get('schoolName')?.setValidators([Validators.required]);
      this.dynamicFields.controls[formIndex].get('schoolName')?.updateValueAndValidity();
      // this.dynamicFields.controls[formIndex].get('eventDate')?.setValidators([Validators.required]);
      // this.dynamicFields.controls[formIndex].get('eventDate')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('studyendDate')?.setValidators([Validators.required, this.pastDateValidator()]);
      this.dynamicFields.controls[formIndex].get('studyendDate')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.setValidators([Validators.required, this.futureDateValidator(), this.studentAgeLimitValidation(formIndex).bind(this), this.disabledOverAgeLimitValidation(formIndex).bind(this)]);
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('relationshipType')?.patchValue(this.getRelationShipType(true, false));
      this.dynamicFields.controls[formIndex].get('inactivedisabledchild')?.patchValue(true);
      if (studyEndDate == "") {
        this.dynamicFields.controls[formIndex].get('schoolName')?.reset();
        this.dynamicFields.controls[formIndex].get('studyendDate')?.reset();
      }
    }
    else {
      this.isStudent = checkedStatus;
      this.dynamicFields.controls[formIndex].get('student')?.patchValue(null);
      this.dynamicFields.controls[formIndex].get('schoolName')?.patchValue('');
      this.dynamicFields.controls[formIndex].get('schoolName')?.clearValidators();
      this.dynamicFields.controls[formIndex].get('schoolName')?.updateValueAndValidity();
      // this.dynamicFields.controls[formIndex].get('eventDate')?.clearValidators();
      // this.dynamicFields.controls[formIndex].get('eventDate')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('studyendDate')?.clearValidators();
      this.dynamicFields.controls[formIndex].get('studyendDate')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.setValidators([Validators.required, this.futureDateValidator(), this.childAgeLimitValidation(formIndex).bind(this), this.disabledOverAgeLimitValidation(formIndex).bind(this)]);
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('relationshipType')?.patchValue(this.getRelationShipType(false, false));
      this.dynamicFields.controls[formIndex].get('inactivedisabledchild')?.patchValue(false);
    }
  }

  checkdisabledchild(checkedStatus: boolean, formIndex: number, dob: any) {
    if (checkedStatus) {
      this.isStudent = false;
      this.dynamicFields.controls[formIndex].get('student')?.patchValue(null);
      this.dynamicFields.controls[formIndex].get('disabled')?.patchValue(checkedStatus);
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.setValidators([Validators.required, this.futureDateValidator()]);
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('relationshipType')?.patchValue(this.getRelationShipType(false, true));
      this.dynamicFields.controls[formIndex].get('inactivestudentchild')?.patchValue(true);
    }
    else {
      this.dynamicFields.controls[formIndex].get('disabled')?.patchValue(null);
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.setValidators([Validators.required, this.futureDateValidator(), this.childAgeLimitValidation(formIndex).bind(this)]);
      this.dynamicFields.controls[formIndex].get('dateOfBirth')?.updateValueAndValidity();
      this.dynamicFields.controls[formIndex].get('relationshipType')?.patchValue(this.getRelationShipType(false, false));
      this.dynamicFields.controls[formIndex].get('inactivestudentchild')?.patchValue(false);
    }
  }

  private getRelationShipType(student: boolean, disabled: boolean): number {
    let _relationShipType = 0;
    if (student) {
      _relationShipType = this.relationshipType.find(y => y.childInternalName == AppConsts.relationShipType.student)?.childLookUpId || 0;
    }
    else if (disabled) {
      _relationShipType = this.relationshipType.find(y => y.childInternalName == AppConsts.relationShipType.disabled)?.childLookUpId || 0;
    }
    else {
      _relationShipType = this.relationshipType.find(y => y.childInternalName == AppConsts.relationShipType.child)?.childLookUpId || 0;
    }
    return _relationShipType;
  }

  public saveDependent() {
    this.dependentDetailsArray = [];
    if (this.isChildrenAvailable !== "1" && this.isChildrenAvailable !== "2") {
      this.isChildrenAvailable = "3";
      return;
    }
    if (this.isNoChild) {
      if (this.dynamicForm.value.dynamicFields.length > 0) {
        // existing childs need to remove and show alert if there is any existing child which was there prior to events
        this.removeAllChildren();
      }
      else { this.createSubscription(); }
      return;
    }
    if (!this.dynamicForm.invalid) {
      if (this.checkduplicateChilddependent()) {
        this.alertText = this.translate['profile_Memberchild_duplicatechilddependent'].toString();
        this.openAlertModal = true;
        return;
      }
      if (this.dynamicForm.value.dynamicFields.length > 0) {
        this.dynamicForm.value.dynamicFields.forEach((form: any, i: number) => {
          this.dependentDetails = new CreateOrEditChildDependentDto();
          this.memberRelationshipCharacteristicList = [];
          this.person.id = form.relationshipToPersonId;
          this.person.firstName = form.firstName.trim();
          this.person.secondName = form.midName;
          this.person.lastName = form.lastName.trim();
          this.person.gender = form.gender;
          this.dependent.id = form.id ? form.id : 0;
          this.dependent.relationshipToPersonId = form.relationshipToPersonId;
          this.dependent.primaryMemberId = this.memberid;
          // Chitransh: Commented this line- form.relationshipCategory was giving null
          //this.dependent.relationshipCategory = form.relationshipCategory
          this.dependent.relationshipCategory = form.relationshipCategory ?? this.relationshipCategory;
          this.dependent.relationshipType = this.getRelationShipType(form.student,
            form.disabled)
          this.dependent.endDate = form.endDate == null || form.endDate == "" ? undefined : form.endDate;
          this.dependent.isActive = this.dependent.endDate == undefined && this.dependent.endDate == null ? true : false;
          //this.person.dateOfBirth = this._formatter.saveFormatString(form.dateOfBirth);
          //this.dependent.startDate = this._formatter.saveFormatString(form.startDate);
          //this.dependent.event_date = form.eventDate == null ? this.dependent.startDate : this._formatter.saveFormatString(form.eventDate);
          this.person.dateOfBirth = (this.isChildDobAvailable === true) ? this._formatter.dateformat(this.benefitEffectiveDate) : this._formatter.dateformat(form.dateOfBirth);
          this.dependent.startDate = this._formatter.dateformat(form.startDate);
          this.dependent.event_date = form.eventDate == null ? this.dependent.startDate : this._formatter.dateformat(form.eventDate);
          if (this.isEnrolmentTypeLE) {
            if (form.dateOfBirth > this.benefitEffectiveDate) {
              this.dependent.startDate = this._formatter.dateformat(form.dateOfBirth);
              this.memberEligibilityDate = this.dependent.startDate;
              this.isBenefitEffectiveDateChanged = true;
            }
          }
          this.dependent.reason_id = this.isEnrolmentTypeLE
            ? this.selectedReasonId
            : form.reason;
          if (form.smoker > 0) {
            let memberRelationshipCharacteristic = new CreateOrEditMemberRelationshipCharacteristicDto();
            memberRelationshipCharacteristic.memberRelationshipId = form.id;
            memberRelationshipCharacteristic.characteristicType = form.smoker;
            memberRelationshipCharacteristic.dataType = this.memberRelationshipCharacteristicType.find(y => y.childInternalName == 'DateTime')?.childLookUpId || 0;
            memberRelationshipCharacteristic.characteristicValue = '';
            memberRelationshipCharacteristic.effectiveDate = this.dependent.startDate;
            this.memberRelationshipCharacteristicList.push(memberRelationshipCharacteristic);
          }
          this.dependentDetails.isChildUpdated = form.isChildUpdated;
          this.dependentDetails.isChildAboveStudentAge = form.isChildAboveStudentAge;
          this.dependentDetails.isChildAboveStudentAgeQC = form.isChildAboveStudentAgeQC;
          this.dependentDetails.dependent = this.dependent;
          this.dependentDetails.person = this.person;
          this.dependentDetails.relationshipCharacteristic = this.memberRelationshipCharacteristicList;
          this.dependentDetails.deptype = 'DependentType';
          this.dependentDetails.memberClassId = this.memberPersonData.memberClassId;
          if (form.student) {
            //this.dependent.event_date = this._formatter.saveFormatString(form.studyendDate);
            this.dependent.event_date = this._formatter.dateformat(form.studyendDate);
            this.dependentDetails.isChildAboveStudentAge;
            this.memberActionRequiredDto = new CreateOrEditMemberActionRequiredDto();
            let currenctDate = this._formatter.dateformat(new Date(Date.now()));
            this.memberActionRequiredDto.memberResponse = "Yes";
            this.memberActionRequiredDto.id = 0;
            this.memberActionRequiredDto.actionCompleted = true;
            this.memberActionRequiredDto.approverCompletedDate = this._formatter.dateformat(currenctDate);
            this.memberActionRequiredDto.dependentId = 0;
            this.memberActionRequiredDto.schoolName = form.schoolName;
            this.memberActionRequiredDto.studyEndDate = this._formatter.dateformat(form.studyendDate);
            this.memberActionRequiredDto.optionType = 1; // certify Now
            this.memberActionRequiredDto.documentId = undefined; //CertificateId
            this.memberActionRequiredDto.isUpdatedFromMember = true;
            this.memberActionRequiredDto.isReviewRequired = true;
            form.isChildAboveStudentAge == true ? this.memberActionRequiredDto.dependentOptionType = 2 : this.memberActionRequiredDto.dependentOptionType = 0;
            this.dependentDetails.memberActionRequired = this.memberActionRequiredDto;
          }
          if (!form.isReadOnly) {
            this.dependentDetailsArray.push(CreateOrEditChildDependentDto.fromJS(this.dependentDetails));
          }
          if ((this.dynamicForm.value.dynamicFields.length - 1) == i) {
            this.submitdependent();
          }
          //--------------- OLD CODE
          // this.dependentDetailsArray.push(CreateOrEditChildDependentDto.fromJS(this.dependentDetails));
          // if (this.dependentDetailsArray.length == this.dynamicForm.value.dynamicFields.length) {
          //   this.submitdependent();
          // }
          //---------------
          //--------------- NEW BUT NOT USED CODE
          //if (this.onFormValueChange(form, i)) {
          //  this.hasChanged = true;
          //  this.dependentDetailsArray.push(CreateOrEditChildDependentDto.fromJS(this.dependentDetails));
          // }
          // if ((this.dynamicForm.value.dynamicFields.length - 1) == i) {
          //   this.submitdependent();
          // }
          //---------------
        });
      }
    }
    else {
      if (this.dynamicForm.value.dynamicFields.length > 0) {
        let items = this.dynamicForm.get('dynamicFields') as FormArray;
        items.controls.forEach((j: any) => {
          let array = j['controls'];
          Object.keys(array).forEach(field => {
            const control = array[field];
            control?.markAsTouched({ onlySelf: true });
          });
        });
      }
    }
  }

  protected submitdependent() {
    if (!this.isBack) {
      let _callingFrom = this.enrolmentType == ENROLMENTTYPE.ANNUAL ? AppConsts.CallingMEMBERAE : AppConsts.CallingMEMBER;
      if (this.isEnrolmentTypeLE) {
        _callingFrom = AppConsts.CallingMEMBER;
      }
      if (this.dependentDetailsArray.length > 0) {
        this.memberDependentService.CreateOrEditMultipledependent(this.dependentDetailsArray, this.memberEligibilityDate, _callingFrom)
          .pipe(takeUntil(this.stop$))
          .subscribe({
            next: (result: CreateOrEditMemberActionRequiredDto[]) => {
              let _result = transformResult(result, null);
              
              // Optimize: Update pending action count asynchronously (non-blocking)
              if (_result != null && _result.length == 0) {
                this.menuService.reRunGetPendingActionCount();
              }

              // Handle student certification data if exists
              if (_result != null && _result.length > 0) {
                this.createOrEditMemberActionRequiredDtos = _result;
                this.getStudentCertificaionData();
                return; // Exit early, getStudentCertificaionData will handle navigation/subscription
              }

              // Handle navigation and subscription based on enrolment type
              if (this.isEnrolmentTypeLE) {
                if (this.isEditModeLE) {
                  this.router.navigate([ROUTE.FAMILYINFORMATION]);
                }
                else {
                  if (this.isBenefitEffectiveDateChanged) {
                    sessionStorage.removeItem(SESSIONKEY.LIFEEVENTBENEFITEFFECTIVEDATE);
                    sessionStorage.setItem(SESSIONKEY.LIFEEVENTBENEFITEFFECTIVEDATE, this._formatter.formattedDate(this.memberEligibilityDate));
                  }
                  this.createSubscription();
                }
              }
              else {
                this.modalSave.emit(true);
              }
            },
            error: (error: any) => {
              console.error('Error saving dependents:', error);
              // Handle error appropriately
            }
          });
      }
      else {
        this.createSubscription();
      }
    }
  }

  private updateMemberAction() {
    this.memberDependentService.updateMemberActionRequired(this.createOrEditMemberActionRequiredDtos)
      .pipe(takeUntil(this.stop$))
      .subscribe({
        next: (result: any) => {
          // Update pending action count asynchronously (non-blocking)
          this.menuService.reRunGetPendingActionCount();
          
          // Handle navigation and subscription based on enrolment type
          if (this.isEnrolmentTypeLE) {
            if (this.isEditModeLE) {
              this.router.navigate([ROUTE.FAMILYINFORMATION]);
            }
            else {
              if (this.isBenefitEffectiveDateChanged) {
                sessionStorage.removeItem(SESSIONKEY.LIFEEVENTBENEFITEFFECTIVEDATE);
                sessionStorage.setItem(SESSIONKEY.LIFEEVENTBENEFITEFFECTIVEDATE, this._formatter.formattedDate(this.memberEligibilityDate));
              }
              this.createSubscription();
            }
          }
          else {
            this.modalSave.emit(true);
          }
        },
        error: (error: any) => {
          console.error('Error updating member action:', error);
          // Still emit modalSave to allow user to proceed
          if (this.isEnrolmentTypeLE && this.isEditModeLE) {
            this.router.navigate([ROUTE.FAMILYINFORMATION]);
          }
          else if (this.isEnrolmentTypeLE) {
            this.createSubscription();
          }
          else {
            this.modalSave.emit(true);
          }
        }
      });
  }
  private createSubscription() {
    let _callingFrom = this.enrolmentType == ENROLMENTTYPE.ANNUAL ? AppConsts.CallingMEMBERAE : AppConsts.CallingMEMBER;
    if (this.isEnrolmentTypeLE) {
      _callingFrom = AppConsts.CallingMEMBER;
    }
    this.memberDependentService.createSubscription(this.memberid, this.memberEligibilityDate, _callingFrom)
      .pipe(takeUntil(this.stop$))
      .subscribe({
        next: (result: any) => {
          let _result = transformResult(result, null);
          if (_result) {
            // if (this.enrolmentType == ENROLMENTTYPE.NEWHIRE)
            //   sessionStorage.setItem(SESSIONKEY.NEWHIRECHILDRENINFO, "set");  
            if (this.isEnrolmentTypeLE) {
              this.router.navigate([ROUTE.BENEFITSELECTION])
            }
            else {
              this.modalSave.emit(true);
            }
          }
          else {
            console.log('subscription creation issue');
            // Still emit modalSave to allow user to proceed
            this.modalSave.emit(true);
          }
        },
        error: (error: any) => {
          console.error('Error creating subscription:', error);
          // Still emit modalSave to allow user to proceed
          this.modalSave.emit(true);
        }
      });
  }
  // private addstudentCertficationObject(index: number, dependentId: number, schoolName: string, studyEndDate: string, chilAboveStudentAge: boolean) {
  //   this.studentCertficationArray.push({
  //     'index': index,
  //     'dependentId': dependentId,
  //     'schoolName': schoolName,
  //     'studyEndDate': studyEndDate,
  //     'chilAboveStudentAge': chilAboveStudentAge
  //   });
  //   return this.studentCertficationArray;
  // }

  closeAlertModal() {
    this.openAlertModal = false;
  }
  private bindReasonOnEdit(): number {
    let reasonId: number = 0;
    if (this.enrolmentType == ENROLMENTTYPE.ANNUAL) {
      reasonId = this.reasonForChild.find(y => y.childInternalName == 'Birth')?.childLookUpId || 0;
    }
    else {
      reasonId = this.reasonForChild.find(y => y.childInternalName == 'NewMemberEnrolment')?.childLookUpId || 0;
    }
    return reasonId;
  }

  private bindReasonOnCreate(): number {
    let reasonId: number = 0;
    if (this.enrolmentType == ENROLMENTTYPE.ANNUAL) {
      reasonId = this.reasonForChild.find(y => y.childInternalName == 'Birth')?.childLookUpId || 0;
    }
    else {
      reasonId = this.reasonForChild.find(y => y.childInternalName == 'NewMemberEnrolment')?.childLookUpId || 0;
    }
    return reasonId;
  }
  checkduplicateChilddependent(): boolean {
    if (this.dynamicForm.value.dynamicFields.length > 0) {
      let _dependentArray: any = [];
      this.dynamicForm.value.dynamicFields.forEach((form: any, i: number) => {
        _dependentArray.push({
          'Name': form.firstName, 'Dob': this._formatter.saveFormatString(form.dateOfBirth)
        });
      });
      var nameArr = _dependentArray.map(function (item: any) { return item.Name });
      var isDuplicatename = nameArr.some(function (item: any, idx: any) {
        return nameArr.indexOf(item) != idx
      });
      var dobArr = _dependentArray.map(function (item: any) { return item.Dob });
      var isDuplicateDob = dobArr.some(function (item: any, idx: any) {
        return dobArr.indexOf(item) != idx
      });
      if (isDuplicatename && isDuplicateDob) {
        return true;
      }
    }
    return false;
  }
  private deleteChildDependent(dependentId?: number, effectiveDate?: string) {
    let TempDate = this.memberEligibilityDate;
    let depDate;
    let dependentEndDate;
    if (effectiveDate != null || effectiveDate != undefined) {
      depDate = this._formatter.formateDate(effectiveDate || "");
    }
    let _benefitEffectiveDate = new Date(this.benefitEffectiveDate);
    let _effectiveDate = this._formatter.isDateOnly(effectiveDate) ? this._formatter.getISOdateString(effectiveDate) : effectiveDate;
    const _dependentEffectDate = new Date(_effectiveDate || "");
    // Condition check before delete child
    const _conditionCheck: boolean = (_dependentEffectDate < _benefitEffectiveDate)
      && (this.enrolmentType == ENROLMENTTYPE.NEWHIRE || this.enrolmentType == ENROLMENTTYPE.ANNUAL)
      ? true : false;
    if (effectiveDate == null || effectiveDate == undefined) {
      dependentEndDate = this._formatter.formattedDate(new Date());
    }
    if (this.enrolmentType == ENROLMENTTYPE.ANNUAL) {
      dependentEndDate = TempDate;
    }
    else {
      dependentEndDate = effectiveDate;
    }

    this.dynamicFields.controls[this.deleteformIndex].get('endDate')?.patchValue(dependentEndDate);
    //let _endDate = this._formatter.formattedDate(dependentEndDate);
    //let _startDate = this._formatter.formattedDate(depDate);
    if (!_conditionCheck) {
      this.onTerminationDependent(true, dependentId);
    }
    else {
      this.onTerminationDependent(false, dependentId);
    }
  }
  public handleDeleteConfirmation(confirmed: any): void {
    if (confirmed) {
      if (this.isNoChild && this.isChildexistsinBulk) {
        this.deleteDependentsBulk();
      }
      else
        this.deleteChildDependent(this.deletedependentId, this.deletedependentEffectiveDate);
    }
    else {
      if (this.deleteformIndex > 0 || this.deleteformIndex == 0)
        this.dynamicFields.controls[this.deleteformIndex].get('endDate')?.patchValue('');
    }
    this.confirmModalIsOpen = false;
  }
  private onTerminationDependent(isSameDate: boolean, dependentId?: number) {
    this.dependent.endDate = this.dynamicFields.controls[this.deleteformIndex].get('endDate')?.value;
    this.memberDependentService.deleteDependent(dependentId, this._formatter.getValidDateString(this.dependent.endDate), false, isSameDate)
      .subscribe({
        next: (result) => {
          let _result = transformResult(result, null);
          if (_result == 0) {
            this.dynamicFields.removeAt(this.deleteformIndex);
            this.deletedependentId = 0;
            this.deletedependentEffectiveDate = "";
            this.deleteformIndex = -1;
            // if no dependent left in list then set NO to radio button
            if (this.dynamicFields !== undefined && this.dynamicFields.length == 0) {
              this.isChildrenAvailable = "2";
              this.isNoChild = true;
            }
            //this.recalculateBenefits(this.memberid, this._formatter.getValidDateString(this.dependent.endDate), 'DEPENDENT-REMOVED');
            this.dependent.endDate = '';
          }
          if (_result > 0) {
            this.dynamicFields.removeAt(this.deleteformIndex);
            this.deletedependentId = 0;
            this.deletedependentEffectiveDate = "";
            this.deleteformIndex = -1;
            // if no dependent left in list then set NO to radio button
            if (this.dynamicFields !== undefined && this.dynamicFields.length == 0) {
              this.isChildrenAvailable = "2";
              this.isNoChild = true;
            }
            //this.recalculateBenefits(this.memberid, this._formatter.getValidDateString(this.dependent.endDate), 'DEPENDENT-REMOVED');
            this.dependent.endDate = '';
          }
        }
      });
    if (dependentId) { this.deleteBeneficaryAllocation(dependentId); }
  }

  private deleteBeneficaryAllocation(deletedependentId: number) {
    this._profileService.DeleteBeneficaryAllocation(this.memberid, deletedependentId).subscribe(res => {
      if (res) {
        console.log(`Dependent Beneficary Deleted Successfully ${deletedependentId}`)
      }
    })
  }
  private removeAllChildren() {
    if (this.dynamicForm.value.dynamicFields.length > 0) {
      this.ArraydependentDeleteModel = [];
      //this.dynamicForm.value.dynamicFields.forEach((form: any, i: number) => {
      for (let form of this.dynamicForm.value.dynamicFields) {
        if (form.id > 0) {
          let dependentItem = new IdeleteDependentModel();
          //let TempDate = this._formatter.formateDate(this.memberEligibilityDate || "");
          let TempDate = this.memberEligibilityDate;
          let depDate;
          let dependentEndDate;
          let _effectiveDate = this._formatter.isDateOnly(form.startDate) ? this._formatter.getISOdateString(form.startDate) : form.startDate;
          const _dependentEffectDate = new Date(_effectiveDate);
          let _benefitEffectiveDate = new Date(this.benefitEffectiveDate);
          // Condition check before delete child
          const _conditionCheck: boolean = (_dependentEffectDate < _benefitEffectiveDate)
            && (this.enrolmentType == ENROLMENTTYPE.NEWHIRE || this.enrolmentType == ENROLMENTTYPE.ANNUAL)
            ? true : false;

          // just check for once and if condition matches,then set true after that no need to enter into second time
          if (_conditionCheck && !this.isChildexistsinBulk)
            this.isChildexistsinBulk = true;

          if (_effectiveDate == null || _effectiveDate == undefined) {
            dependentEndDate = this._formatter.formattedDate(new Date());
          }
          if (this.enrolmentType == ENROLMENTTYPE.ANNUAL) {
            dependentEndDate = TempDate;
          }
          else {
            //dependentEndDate = this._formatter.formattedDate(_effectiveDate);
            dependentEndDate = _effectiveDate;
          }
          const _isSameDate: boolean = !_conditionCheck ? true : false;
          dependentItem.memberId = this.memberid;
          dependentItem.dependentId = form.id;
          dependentItem.endDate = this._formatter.getValidDateString(dependentEndDate);
          dependentItem.isStudentDeleted = false; // need to revisit this one.
          dependentItem.isSameDate = _isSameDate;
          this.ArraydependentDeleteModel.push(IdeleteDependentModel.fromJS(dependentItem));
        }
      }
    }
    // set modal popup flag to show/hide
    if (this.ArraydependentDeleteModel != null && this.ArraydependentDeleteModel.length > 0) {
      if (this.isChildexistsinBulk) {
        let currentchild = this.translate['profile_child'].toString();
        this.confirmalertTitle = this.translate['profile_dependentDeleteMessagetitle'].toString().replace('<dependent>', currentchild);
        this.confirmalertText = this.translate['profile_userDeleteConfirm'].toString() + ' ' + this.translate['profile_dependentDeleteMessage'].toString().replace('<dependent>', currentchild);
        this.confirmModalIsOpen = true;
        return;
      }
      else { this.deleteDependentsBulk(); }
    }
    else {
      this.dynamicForm.reset();
      this.modalSave.emit(true);
    }
  }
  private deleteDependentsBulk() {
    this.memberDependentService.deleteDependentsBulk(this.ArraydependentDeleteModel)
      .subscribe({
        next: (result) => {
          let _result = transformResult(result, null);
          if (_result) {
            this.createSubscription();
            this.dynamicForm.reset();
            this.ArraydependentDeleteModel = [];
          }
        }
      });
  }
  // private recalculateBenefits(memberId: number, effDate: string, reason: string) {
  //   this.memberDependentService.autoSyncMemberBenefits(memberId, effDate, reason, true)
  //     .subscribe({
  //       next: (result) => {
  //         let _result = transformResult(result, null);
  //       }
  //     });
  // }
  private isFormReadOnly(effectiveDate?: string): boolean {
    let _benefitEffectiveDate = new Date(this.benefitEffectiveDate);
    let _effectiveDate = this._formatter.isDateOnly(effectiveDate) ? this._formatter.getISOdateString(effectiveDate) : effectiveDate;
    const _dependentEffectDate = new Date(_effectiveDate || "");
    const _conditionCheck: boolean = (_dependentEffectDate < _benefitEffectiveDate)
      ? true : false;
    return _conditionCheck;
  }
  private setReadOnlyControls(formIndex: number) {
    let formArray = this.dynamicForm.get('dynamicFields') as FormArray;
    formArray.controls[formIndex].disable();
    this.dynamicFields.controls[formIndex].get('isReadOnly')?.patchValue(true);
  }
  // private setReadWriteControls(formIndex: number) {
  //   let formArray = this.dynamicForm.get('dynamicFields') as FormArray;
  //   formArray.controls[formIndex].enable();
  //   this.dynamicFields.controls[formIndex].get('isReadOnly')?.patchValue(true);
  // }
  // onFormValueChange(form: any, i: number): boolean {
  //   debugger
  //   let isChanged = false;
  //   if (this.initialFormValues != undefined) {
  //     // Perform a deep comparison to check for meaningful changes
  //     //if (this.dynamicForm.value.dynamicFields.length > 0) {
  //     //this.dynamicForm.value.dynamicFields.forEach((form: any, i: number) => {
  //     isChanged = JSON.stringify(this.initialFormValues.dynamicFields[i].relationshipType) !== JSON.stringify(form.relationshipType) ? true : isChanged;
  //     isChanged = JSON.stringify(this.initialFormValues.dynamicFields[i].firstName) !== JSON.stringify(form.firstName) ? true : isChanged;
  //     isChanged = JSON.stringify(this.initialFormValues.dynamicFields[i].lastName) !== JSON.stringify(form.lastName) ? true : isChanged;
  //     isChanged = JSON.stringify(this.initialFormValues.dynamicFields[i].gender) !== JSON.stringify(form.gender) ? true : isChanged;
  //     let dob1 = this._formatter.dateformat(this.initialFormValues.dynamicFields[i].dateOfBirth);
  //     let dob2 = this._formatter.dateformat(form.dateOfBirth);
  //     isChanged = JSON.stringify(dob1) !== JSON.stringify(dob2) ? true : isChanged;
  //     isChanged = JSON.stringify(this.initialFormValues.dynamicFields[i].schoolName) !== JSON.stringify(form.schoolName) ? true : isChanged;
  //     let studyendDate1 = (this.initialFormValues.dynamicFields[i].eventDate != "" || this.initialFormValues.dynamicFields[i].eventDate != undefined) ? this._formatter.dateformat(this.initialFormValues.dynamicFields[i].eventDate) : "";
  //     let studyendDate2 = (form.eventDate != "" || form.eventDate != undefined) ? this._formatter.dateformat(form.eventDate) : "";
  //     isChanged = JSON.stringify(studyendDate1) !== JSON.stringify(studyendDate2) ? true : isChanged;
  //     //});
  //     //}
  //   }
  //   else {
  //     isChanged = true;
  //   }
  //   return isChanged;
  // }

  private removeLastChildField() {
    if (this.dynamicFields && this.dynamicFields.length > 0) {
      this.dynamicFields.removeAt(this.dynamicFields.length - 1);
    }
  }
}



