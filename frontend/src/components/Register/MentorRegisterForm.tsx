import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import MentorTimeBtn from '@components/Register/MentorTimeBtn';
import { IMenteeCalendar } from 'types/calendar';
import 'dayjs/locale/ko';
import { timeArray } from '@constants/todayRange';
import Intro from '@components/common/Intro';
import SmallCalendar from './SmallCalendar';
import RegisterBtn from '@components/common/RegisterBtn';
import { postMentorSchedules } from '@/apis/register';
import { MySwal } from '@/config/config';
import { useNavigate } from 'react-router-dom';
import Loading from '../common/Loading';
import useUserStore from '@/store/useUserStore';

const MentorRegisterForm = ({ isMentor }: { isMentor: boolean }) => {
  // 이거 추후에 zustand로 바꿀 것
  const [result, setResult] = useState<IMenteeCalendar<string>>({
    day: dayjs(Date()).format('YYYY-MM-DD'),
    schedules: timeArray,
  });

  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useNavigate();

  const email = useUserStore((state) => state.email);

  useEffect(() => {
    if (!email) {
      MySwal.fire({
        icon: 'warning',
        text: '이메일이 필요합니다. 이메일 설정 후 다시 시도해주세요.',
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        router('/my-page');
      });
    }
  }, [email, router]);

  const onRegister = async () => {
    setIsLoading(true);
    const data = await postMentorSchedules(`${result.day} ${time}`);
    setIsLoading(false);

    if (!data) {
      MySwal.fire({
        icon: 'error',
        text: '해당 날짜에 이미 일정이 존재합니다',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      MySwal.fire({
        icon: 'success',
        text: '등록이 완료되었습니다',
        showConfirmButton: false,
        timer: 1500,
      });
      router('/');
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Intro title="일정 등록하기" sub="면접 날짜와 시간을 선택해주세요." />
          <div className="flex gap-20">
            <SmallCalendar
              timeArray={result}
              changeTime={setResult}
              setTime={setTime}
              isMentor={isMentor}
              isRegister={false}
            />
            <>
              <div className="flex flex-col gap-6 w-[480px] h-[438px] px-10">
                <div>📅 {dayjs(result.day).format('YYYY년 MM월 DD일')}</div>
                {isMentor && result.day === dayjs(Date()).format('YYYY-MM-DD') ? (
                  <>
                    <div>날짜를 선택해주세요</div>
                  </>
                ) : (
                  <>
                    <div>
                      <MentorTimeBtn props={result} setStateValue={setTime} value={time} />
                    </div>
                    <RegisterBtn
                      text="등록하기"
                      width="w-3/4"
                      height="h-[50px]"
                      fontSize="text-lg"
                      onClick={
                        time !== ''
                          ? onRegister
                          : result.day === dayjs(Date()).format('YYYY-MM-DD') &&
                            dayjs().isBefore(dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`))
                          ? () =>
                              MySwal.fire({
                                html: `<b>오늘 날짜 시간 이후로 선택해주세요</b>`,
                              })
                          : () => {
                              MySwal.fire({
                                html: `<b>시간을 선택해주세요</b>`,
                              });
                            }
                      }
                    />
                  </>
                )}
              </div>
            </>
          </div>
        </>
      )}
    </>
  );
};

export default MentorRegisterForm;
