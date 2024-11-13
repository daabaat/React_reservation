import { useState, useEffect } from "react";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import "react-calendar/dist/Calendar.css";

import "./App.css";

function App() {
  const [reservations, setReservations] = useState([]);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateId, setUpdateId] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/reservations");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkout);
      const reservations = [];

      // 체크인 날짜 (PM)
      reservations.push({
        date: new Date(checkinDate.getTime() - 9 * 60 * 60 * 1000), // UTC 시간으로 변환
        timeSlot: "PM",
        isCheckIn: true,
        isCheckOut: false,
      });

      // 중간 날짜들 (AM, PM 모두)
      let currentDate = new Date(checkinDate);
      currentDate.setDate(currentDate.getDate() + 1);

      while (currentDate < checkoutDate) {
        // UTC 시간으로 변환
        const utcDate = new Date(currentDate.getTime() - 9 * 60 * 60 * 1000);

        // AM 예약
        reservations.push({
          date: utcDate,
          timeSlot: "AM",
          isCheckIn: false,
          isCheckOut: false,
        });
        // PM 예약
        reservations.push({
          date: utcDate,
          timeSlot: "PM",
          isCheckIn: false,
          isCheckOut: false,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 체크아웃 날짜 (AM)
      reservations.push({
        date: new Date(checkoutDate.getTime() - 9 * 60 * 60 * 1000), // UTC 시간으로 변환
        timeSlot: "AM",
        isCheckIn: false,
        isCheckOut: true,
      });

      const response = await fetch(
        "http://localhost:8080/api/reservations/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reservations }), // 예약 데이터 배열 전송
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "예약 생성에 실패했습니다.");
      }

      const savedReservations = await response.json();
      setReservations((prev) => [...prev, ...savedReservations]);
      setCheckin("");
      setCheckout("");
      alert("예약이 성공적으로 생성되었습니다.");
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert(error.message);
    }
  };

  const tileDisabled = ({ date }) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      const reservationsForDate = reservations.filter((r) => {
        if (!r.date) return false;
        const rDate = new Date(r.date);
        const koreaRDate = new Date(rDate.getTime() + 9 * 60 * 60 * 1000);
        return koreaRDate.toISOString().split("T")[0] === formattedDate;
      });

      // AM과 PM 모두 예약된 경우에만 비활성화
      const hasAM = reservationsForDate.some((r) => r.timeSlot === "AM");
      const hasPM = reservationsForDate.some((r) => r.timeSlot === "PM");

      return hasAM && hasPM;
    } catch (error) {
      console.error("Error in tileDisabled:", error);
      return false;
    }
  };

  const tileClassName = ({ date }) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      const reservationsForDate = reservations.filter((r) => {
        if (!r.date) return false;
        const rDate = new Date(r.date);
        const koreaRDate = new Date(rDate.getTime() + 9 * 60 * 60 * 1000);
        return koreaRDate.toISOString().split("T")[0] === formattedDate;
      });

      if (reservationsForDate.length === 0) return "";

      const hasAM = reservationsForDate.some((r) => r.timeSlot === "AM");
      const hasPM = reservationsForDate.some((r) => r.timeSlot === "PM");

      // 시각적으로 AM/PM 예약 상태 표시
      if (hasAM && hasPM) return "fully-reserved";
      if (hasAM) return "am-reserved";
      if (hasPM) return "pm-reserved";

      return "";
    } catch (error) {
      console.error("Error in tileClassName:", error);
      return "";
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reservations/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // 예약 삭제 후 새로고침
      setReservations((prev) =>
        prev.filter((reservation) => reservation._id !== id)
      );
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  const handleUpdate = (id) => {
    const reservationToUpdate = reservations.find(
      (reservation) => reservation._id === id
    );
    setCheckin(""); // 체크인 날짜 초기화
    setCheckout(""); // 체크아웃 날짜 초기화
    setUpdateId(id);
    setIsUpdating(true);
  };

  const handleDateChange = (date, isCheckIn = true) => {
    try {
      const selectedDate = new Date(date);
      // 시간대 차이 보정
      selectedDate.setHours(0, 0, 0, 0);
      const formattedDate = selectedDate.toISOString().split("T")[0];

      if (isCheckIn) {
        setCheckin(formattedDate);
        console.log("체크인 날짜:", formattedDate);
      } else {
        setCheckout(formattedDate);
        console.log("체크아웃 날짜:", formattedDate);
      }
    } catch (error) {
      console.error("Error in handleDateChange:", error);
    }
  };

  const handleConfirmUpdate = async () => {
    const confirmUpdate = window.confirm("해당 날짜로 수정하시겠습니까?");
    if (confirmUpdate) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/reservations/update/${updateId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              date: checkin,
              timeSlot: "PM", // 또는 "AM"
              isCheckIn: true, // 상황에 따라 적절히 설정
              isCheckOut: false, // 상황에 따라 적절히 설정
            }),
          }
        );
        // ... 나머지 코드
      } catch (error) {
        console.error("Error updating reservation:", error);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
          required
        />
        <input
          type="date"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          required
        />
        <button type="submit">예약하기</button>
      </form>
      <Calendar tileDisabled={tileDisabled} tileClassName={tileClassName} />
      {isUpdating && (
        <div>
          <h3>체크인 날짜를 선택해주세요</h3>
          <Calendar
            onChange={(date) => handleDateChange(date, true)}
            value={checkin ? new Date(checkin) : null}
          />
          <div>
            <h4>체크아웃 날짜 선택</h4>
            <Calendar
              onChange={(date) => handleDateChange(date, false)}
              value={checkout ? new Date(checkout) : null}
              minDate={checkin ? new Date(checkin) : null} // 체크인 날짜 이후만 선택 가능
            />
          </div>
          {checkin && checkout && (
            <button onClick={handleConfirmUpdate}>수정하기</button>
          )}
        </div>
      )}
      <ul>
        {reservations.map((reservation, index) => (
          <li key={index}>
            {
              new Date(
                new Date(reservation.date).getTime() + 9 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0]
            }{" "}
            {reservation.timeSlot}
            {reservation.isCheckIn && " (체크인)"}
            {reservation.isCheckOut && " (체크아웃)"}
            <button onClick={() => handleDelete(reservation._id)}>
              삭제하기
            </button>
            <button onClick={() => handleUpdate(reservation._id)}>
              수정하기
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
