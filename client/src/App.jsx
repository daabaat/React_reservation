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
    e.preventDefault(); // 기본 폼 제출 방지
    const newReservation = { checkin, checkout };

    try {
      const response = await fetch(
        "http://localhost:8080/api/reservations/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newReservation),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const savedReservation = await response.json();
      setReservations((prev) => [...prev, savedReservation]); // 새 예약 추가
      setCheckin(""); // 입력 필드 초기화
      setCheckout(""); // 입력 필드 초기화
    } catch (error) {
      console.error("Error creating reservation:", error);
    }
  };

  const tileDisabled = ({ date }) => {
    try {
      // date 객체를 안전하게 처리
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const reservationsForDate = reservations.filter((r) => {
        if (!r.date) return false;
        const rDate = new Date(r.date);
        return rDate.toISOString().split("T")[0] === formattedDate;
      });

      // 해당 날짜의 AM, PM 모두 예약된 경우 비활성화
      return reservationsForDate.length >= 2;
    } catch (error) {
      console.error("Error in tileDisabled:", error);
      return false;
    }
  };

  const tileClassName = ({ date }) => {
    try {
      // date 객체를 안전하게 처리
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const reservationsForDate = reservations.filter((r) => {
        if (!r.date) return false;
        const rDate = new Date(r.date);
        return rDate.toISOString().split("T")[0] === formattedDate;
      });

      if (reservationsForDate.length === 0) return "";

      // AM/PM 예약 상태에 따른 클래스 반환
      const hasAM = reservationsForDate.some((r) => r.timeSlot === "AM");
      const hasPM = reservationsForDate.some((r) => r.timeSlot === "PM");

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
            body: JSON.stringify({ checkin, checkout }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const updatedReservation = await response.json();
        setReservations((prev) =>
          prev.map((reservation) =>
            reservation._id === updateId ? updatedReservation : reservation
          )
        );
        setCheckin(""); // 입력 필드 초기화
        setCheckout(""); // 입력 필드 초기화
        setIsUpdating(false); // 수정 모드 종료
        setUpdateId(null); // 수정할 예약 ID 초기화
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
            Check-in: {new Date(reservation.checkin).toLocaleString()} -
            Check-out: {new Date(reservation.checkout).toLocaleString()}
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
