import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import "react-calendar/dist/Calendar.css";
import LoginForm from "./components/LoginForm";
import SearchForm from "./components/SearchForm";
import {
  fetchReservations,
  createReservation,
  deleteReservation,
  updateReservation,
} from "./api/reservationApi";
import { fetchTimeSlots } from "./api/timeSlotApi";
import { fetchAccommodations } from "./api/accommodationApi";
import { fetchUsers } from "./api/userApi";

import "./App.css";

function App() {
  const [reservations, setReservations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [users, setUsers] = useState([]);

  const loadAccommodations = async () => {
    try {
      const data = await fetchAccommodations();
      setAccommodations(data);
      console.log("숙소 데이터:", data);
    } catch (error) {
      console.error("숙소 데이터 조회 실패:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
      console.log("사용자 데이터:", data);
    } catch (error) {
      console.error("사용자 데이터 조회 실패:", error);
    }
  };

  useEffect(() => {
    loadAccommodations();
    loadUsers();
    fetchData();
  }, []);

  const tileDisabled = ({ date }) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      const timeSlot = timeSlots.find((slot) => {
        const slotDate = new Date(slot.date);
        const koreaSlotDate = new Date(slotDate.getTime() + 9 * 60 * 60 * 1000);
        return koreaSlotDate.toISOString().split("T")[0] === formattedDate;
      });

      if (!timeSlot) return false;
      return timeSlot.am.isReserved && timeSlot.pm.isReserved;
    } catch (error) {
      console.error("Error in tileDisabled:", error);
      return false;
    }
  };

  const tileClassName = ({ date }) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      const timeSlot = timeSlots.find((slot) => {
        const slotDate = new Date(slot.date);
        const koreaSlotDate = new Date(slotDate.getTime() + 9 * 60 * 60 * 1000);
        return koreaSlotDate.toISOString().split("T")[0] === formattedDate;
      });

      if (!timeSlot) return "";

      if (timeSlot.am.isReserved && timeSlot.pm.isReserved)
        return "fully-reserved";
      if (timeSlot.am.isReserved) return "am-reserved";
      if (timeSlot.pm.isReserved) return "pm-reserved";

      return "";
    } catch (error) {
      console.error("Error in tileClassName:", error);
      return "";
    }
  };

  const fetchData = async () => {
    try {
      const [reservationsData, timeSlotsData] = await Promise.all([
        fetchReservations(),
        fetchTimeSlots(),
      ]);

      setReservations(reservationsData);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      alert("데이터 조회에 실패했습니다");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReservation(checkin, checkout);
      await fetchData();
      setCheckin("");
      setCheckout("");
      alert("예약이 성공적으로 생성되었습니다");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("예약을 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        await deleteReservation(id);
        await fetchData();
        alert("예약이 삭제되었습니다");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleUpdate = (id) => {
    const reservationToUpdate = reservations.find(
      (reservation) => reservation._id === id
    );

    const startDate = new Date(reservationToUpdate.startDate);
    const endDate = new Date(reservationToUpdate.endDate);

    const koreaStartDate = new Date(startDate.getTime() + 9 * 60 * 60 * 1000);
    const koreaEndDate = new Date(endDate.getTime() + 9 * 60 * 60 * 1000);

    setCheckin(koreaStartDate.toISOString().split("T")[0]);
    setCheckout(koreaEndDate.toISOString().split("T")[0]);
    setUpdateId(id);
    setIsUpdating(true);
  };

  const handleDateChange = (date, isCheckIn = true) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

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
        await updateReservation(updateId, checkin, checkout);
        await fetchData();
        setIsUpdating(false);
        setUpdateId(null);
        setCheckin("");
        setCheckout("");
        alert("예약이 수정되었습니다");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <Router>
      <div>
        <nav>
          <Link to="/login">
            <button>로그인</button>
          </Link>
          <Link to="/search">
            <button>검색</button>
          </Link>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/search" element={<SearchForm />} />
          <Route
            path="/"
            element={
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
                <Calendar
                  tileDisabled={tileDisabled}
                  tileClassName={tileClassName}
                />
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
                  {reservations.map((reservation) => (
                    <li key={reservation._id} className="reservation-item">
                      <div className="reservation-info">
                        <h3>예약 정보</h3>
                        <p>
                          <strong>숙소:</strong>{" "}
                          {reservation.accommodationId.name}
                          <br />
                          <strong>주소:</strong>{" "}
                          {reservation.accommodationId.address}
                          <br />
                          <strong>가격:</strong>{" "}
                          {reservation.accommodationId.price.toLocaleString()}원
                          <br />
                          <strong>지역:</strong>{" "}
                          {reservation.accommodationId.region}
                        </p>
                        <p>
                          <strong>예약자:</strong> {reservation.userId.name}
                          <br />
                          <strong>연락처:</strong> {reservation.userId.phone}
                        </p>
                        <p>
                          <strong>체크인:</strong>{" "}
                          {new Date(reservation.startDate).toLocaleDateString()}{" "}
                          PM
                          <br />
                          <strong>체크아웃:</strong>{" "}
                          {new Date(reservation.endDate).toLocaleDateString()}{" "}
                          AM
                          <br />
                          <strong>인원:</strong> {reservation.person}명
                        </p>
                      </div>
                      <div className="reservation-actions">
                        <button onClick={() => handleDelete(reservation._id)}>
                          삭제하기
                        </button>
                        <button onClick={() => handleUpdate(reservation._id)}>
                          수정하기
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
