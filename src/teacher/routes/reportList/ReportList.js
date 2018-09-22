import React, {PureComponent} from 'react';
import DocumentTitle from 'react-document-title';
import './ReportList.scss';
import {
    MadSubTitle,
    MadButton,
    MadLoadingView,
    MadInput,
    MadModal,
    MadLinearLayout,
    MadLabeled,
    MadTooltip,
    MadLocalDateFormat,
    Gap
} from 'madComponents';
import {GradeType, GradeTypeShort} from "../.././../shared/gradeType";
import moment from 'moment';
import FormUtils, {FORM_TYPE} from "../../../shared/formUtils";

export default class ReportList extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            search: '',
            reportLoadingInProgress: {},
            sendSmsInProgress: false,
            modal: {},
        };
    }

    componentDidMount() {
        this.fetchCourse();
    }

    fetchCourse = () => {
        this.props.fetchCourse(this.props.match.params.id).then(() => {
            this.props.listSms();
        });
    };

    searchByText = (student) => {
        if (this.state.search.length === 0) return true;

        const grade = GradeType[student.grade] + GradeTypeShort[student.grade];
        const name = student.nickname;
        const searchWords = this.state.search.split(' ');

        if (searchWords.length === 1)
            return grade.includes(searchWords[0]) || name.includes(searchWords[0]);
        else
            return grade.includes(searchWords[0]) && name.includes(searchWords[1]);
    };

    showReport = (student) => {
        let courseId = this.props.course.id;
        let studentId = student.id;
        let reportRange = this.setReportRange();
        this.setState({
            reportLoadingInProgress: {
                [studentId]: true,
            },
        });

        this.props.createReportData(courseId, studentId, reportRange.year, reportRange.startWeek, reportRange.endWeek).then(r => {
            if (r) {
                this.setState({
                    reportLoadingInProgress: {
                        [studentId]: false,
                    },
                });
                this.openReport(courseId, studentId, reportRange.year, reportRange.startWeek, reportRange.endWeek);
            }
        }).catch(e => {
            this.setState({
                reportLoadingInProgress: {
                    [studentId]: false,
                },
            });
            alert("보고서를 만드는중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            console.log(e);
        });
    };

    openReport = (courseId, studentId, year, weekOfYearFrom, weekOfYearTo) => {
        this.setState({isPopupBlocked: false});
        let url = `/m/report/${courseId}/${studentId}/${year}/${weekOfYearFrom}/${weekOfYearTo}/textbook`;
        let popup = window.open(url, "popup", "width=800, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
    };

    openPopUpUrl = () => {
        this.setState({isPopupBlocked: false});
        window.open(this.state.blockedPopUpUrl, "popup", "width=800, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
    };

    setReportRange = () => {
        let startYear = moment().subtract(4, 'week').year();
        let startWeek = moment().subtract(4, 'week').isoWeek();
        let endWeek = moment().subtract(1, 'week').isoWeek();

        return {
            year: startYear,
            startWeek: startWeek,
            endWeek: endWeek,
        }
    };

    closeModal = modalName => {
        this.setState({
            modal: {
                ...this.state.modal,
                [modalName]: false,
            }
        })
    };

    openReportSendModal = (student) => {
        let courseId = this.props.course.id;
        let studentId = student.id;
        let reportRange = this.setReportRange();
        this.setState({
            reportLoadingInProgress: {
                [studentId]: true,
            },
            modal: {
                ...this.state.modal,
                reportSendModal: true,
            },
            reportSendForm: {}
        });

        this.props.createReportData(courseId, studentId, reportRange.year, reportRange.startWeek, reportRange.endWeek)
            .then(result => {
                if (result) return this.props.getReportData(courseId, studentId, reportRange.year, reportRange.startWeek, reportRange.endWeek);
                return Promise.reject(result);
            })
            .then(reports => {
                let student = reports[0].student;
                this.setState({
                    reportSendForm: {
                        courseId,
                        student,
                        reports,
                        phoneNumber: reports[0].student.parentPhoneNumber,
                        url: `/m/report/${courseId}/${studentId}/${reportRange.year}/${reportRange.startWeek}/${reportRange.endWeek}/textbook`,
                        key: `${reportRange.year}/${reportRange.startWeek}/${reportRange.endWeek}`,
                    }
                });
                // TODO 등록된 번호화 다를 경우 저장 여부

                this.setState({
                    reportLoadingInProgress: {
                        [studentId]: false,
                    },
                });
            });
    };

    sendSms = () => {
        if (!confirm(`휴대폰 번호: "${this.state.reportSendForm.phoneNumber}" 로 메시지를 전송합니다`)) return;

        this.setState({sendSmsInProgress: true});
        this.props.sendSms({
            reports: this.state.reportSendForm.reports,
            phoneNumber: this.state.reportSendForm.phoneNumber,
            courseId: this.state.reportSendForm.courseId,
            studentId: this.state.reportSendForm.student.id,
            key: this.state.reportSendForm.key,
        })
            .then(r => {
                if (r) {
                    alert("전송 완료");
                    this.closeModal('reportSendModal');
                } else alert("전송 실패");
                this.setState({sendSmsInProgress: false});
            })
            .catch(e => {
                console.log(e);
                alert("전송 실패");
                this.closeModal('reportSendModal');
                this.setState({sendSmsInProgress: false});
            });
    };

    isReportSendFormValid = () => {
        return FormUtils.checkPhoneNumber(this.state.reportSendForm.phoneNumber, FORM_TYPE.CELLPHONE.pattern);
    };

    render() {
        let {recentSmsHistory} = this.props;

        return <DocumentTitle title='수업 - 모바일 보고서'>
            <div className="report-list row">
                <div className="card column is-12">
                    <div className="row">
                        {
                            this.state.isPopupBlocked &&
                            <p style={{
                                color: 'white',
                                background: '#ff6f00',
                                padding: '6px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                marginTop: 0,
                                width: '100%',
                                cursor: 'pointer'
                            }} onClick={this.openPopUpUrl}>출력 화면이 나타나지 않을 경우 브라우저에서 팝업 차단을 해제해주세요</p>
                        }
                    </div>
                    <div className="row" style={{marginTop: 0}}>
                        <div className="column is-flex"><MadSubTitle text='모바일 보고서'/></div>
                        <div className="column is-flex alert-div"><span className="alert">이번 주 학습한 내용은 다음 주에 확인하실 수 있습니다.</span></div>
                    </div>
                    <div className="row" style={{
                        height: `calc(100vh - 250px)`,
                        overflow: 'hidden',
                    }}>
                        <div className="column is-12">
                            <div className="student-search-header">
                                <MadInput type="search" icon="magnify" width={'100%'} placeholder="고등1 홍길동 또는 홍길동으로 검색하세요."
                                          text={this.state.search}
                                          onChange={e => this.setState({
                                              search: e.target.value
                                          })}/>
                            </div>
                            <div>
                                <div className="row is-gapless is-vcentered bottom-line simple-list-header"
                                     style={{fontSize: '15px'}}>
                                    <div className="column is-1 padding-cell" style={{textAlign: 'left'}}>학년</div>
                                    <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>이름</div>
                                    <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>부모님 전화번호</div>
                                    <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>최근 전송</div>
                                    <div className="column is-3 padding-cell"/>
                                </div>
                                <div style={{overflow: 'scroll', overflowX: 'visible', height: `calc(100vh - 373px)`}}>
                                    {
                                        this.props.course &&
                                        this.props.course.students &&
                                        this.props.course.students
                                            .filter(s => s.enabled)
                                            .filter(this.searchByText)
                                            .map(student => {
                                                return <div key={student.id} className="row assignment-list-item is-gapless is-vcentered bottom-line-light simple-list-item">
                                                    <div className="column is-1 padding-cell">{GradeType[student.grade]}</div>
                                                    <div className="column is-2 padding-cell">{student.nickname}</div>
                                                    <div className="column is-3 padding-cell">{student.parentPhoneNumber}</div>
                                                    <div className="column is-3 padding-cell">
                                                        {
                                                            recentSmsHistory[student.id] ?
                                                                <MadTooltip overlay={recentSmsHistory[student.id].phoneNumber}>
                                                                    <span>
                                                                        <MadLocalDateFormat localDate={recentSmsHistory[student.id].createdDate} format="MM/DD HH:ss 전송"/>
                                                                        <small className="recent-sms-history-info">({recentSmsHistory[student.id].info})</small>
                                                                    </span>
                                                                </MadTooltip>
                                                                : '-'
                                                        }
                                                    </div>
                                                    <div className="column is-3 is-vcentered padding-cell" style={{textAlign: 'right'}}>
                                                        <MadButton text="보기" ghost sm
                                                                   onClick={() => this.showReport(student)}
                                                                   isLoading={this.state.reportLoadingInProgress[student.id]}/>
                                                        <Gap h xs/>
                                                        <MadButton text="전송" ghost sm onClick={() => this.openReportSendModal(student)}/>
                                                    </div>
                                                </div>
                                            })
                                    }
                                </div>
                                {
                                    this.props.course &&
                                    this.props.course.students.length === 0 &&
                                    <MadLoadingView showText={true}/>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    this.state.modal['reportSendModal'] &&
                    <MadModal
                        isOpen={this.state.modal['reportSendModal']}
                        onRequestClose={() => this.closeModal('reportSendModal')}
                        shouldCloseOnOverlayClick={false}
                        size={'sm'}
                        closeButton={true}>
                        <MadSubTitle>모바일 보고서 SMS 전송&nbsp;
                            <MadTooltip overlay={"카카오톡으로 모바일 보고서를 전송합니다. 실패시 문자 메시지로 전송됩니다."}>
                                <i className="mdi mdi-help-circle" style={{color: 'orange'}}/>
                            </MadTooltip>
                        </MadSubTitle>
                        <Gap/>
                        <MadLinearLayout>
                            <MadLabeled label="학생" labelAlign='left' labelWidth='25%'>
                                {
                                    this.state.reportSendForm.student && this.state.reportSendForm.student.nickname
                                }
                            </MadLabeled>
                            <MadLabeled label="휴대폰 번호" labelAlign='left' labelWidth='25%'>
                                <MadInput width='100%' placeholder="010-0000-0000"
                                          text={FormUtils.toPhoneNumberFormat(this.state.reportSendForm.phoneNumber)}
                                          pattern={FORM_TYPE.CELLPHONE.pattern}
                                          errorMessage="올바른 휴대폰 번호를 입력해주세요"
                                          onChange={e => this.setState({
                                              reportSendForm: {
                                                  ...this.state.reportSendForm,
                                                  phoneNumber: FormUtils.toPhoneNumberFormat(e.target.value)
                                              }
                                          })}
                                          autoFocus
                                />
                            </MadLabeled>
                        </MadLinearLayout>
                        <Gap line lg/>
                        <MadSubTitle style={{
                            margin: '15px',
                            textAlign: 'center',
                        }}>
                            <small>보고서 미리보기</small>
                        </MadSubTitle>
                        <iframe src={this.state.reportSendForm.url} frameBorder="0"
                                style={{
                                    transform: 'scale(0.6)',
                                    width: '167%',
                                    height: '1000px',
                                    transformOrigin: '0 0',
                                    marginBottom: '-377px',
                                }}/>
                        <MadButton text="전송" size="fw" onClick={() => this.sendSms()} disabled={!this.isReportSendFormValid()} isLoading={this.state.sendSmsInProgress}/>
                    </MadModal>
                }
            </div>
        </DocumentTitle>;
    }
};
