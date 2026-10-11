---
title: 예제 - 메시지 관련 구성요소
summary: managed RAP BO 의 validation 과 global 권한 메서드에서 reported 를 채우며 %msg, %element, %global, %other, %own, %path, %state_area 를 쓰는 예제입니다.
keywords: reported, REPORTED EARLY, REPORTED LATE, %msg, %element, %global, %other, %own, %path, %state_area, validation, 검증, get_global_authorizations, COMMIT ENTITIES RESPONSE OF, ROLLBACK ENTITIES, 상태 메시지, 전이 메시지, 메시지, 예제
---

## 설명

managed([[abenbdl_impl_type]]) RAP BO 에서 메시지와 얽힌 BDEF derived type(BDEF 파생 타입) 구성요소를 써 보는 예제입니다. 다루는 구성요소는 다음과 같습니다.

- [[abapderived_types_msg]]
- [[abapderived_types_element]]
- [[abapderived_types_global]]
- [[abapderived_types_other]]
- [[abapderived_types_own]]
- [[abapderived_types_path]]
- [[abapderived_types_state_area]]

데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티)입니다. BDEF 에서 root entity 는 `authorization master ( global )` 이고, child entity 에는 저장할 때 도는 validation 이 하나 있습니다.

메시지는 behavior pool(동작 풀)의 두 메서드에서 만듭니다.

- `get_global_authorizations` : 생성·수정·삭제를 권한 있는 사용자만 할 수 있게 하는 메서드입니다. 데모를 단순하게 하려고 권한 객체 없이 변수 하나(`auth_flag`)로 권한 유무를 흉내 내며, 여기서는 권한이 있다고 답합니다. 그러면서 `reported` 에 메시지(`%msg`)를 하나 넣습니다. 요청 매개변수 `requested_authorizations` 에서 표시된 작업에 맞춰 [[abapderived_types_create]], [[abapderived_types_update]], [[abapderived_types_delete]] 도 채웁니다. 이 메시지는 transition message(전이 메시지)이므로 `%global` 에도 표시를 합니다.
- validation 메서드 : child entity 의 숫자 필드 값이 root entity 의 두 숫자 필드 값 사이에 있는지 살핍니다. 벗어나면 validation 이 실패하고 `failed` 와 `reported` 를 채웁니다. 이때 `reported` 는 `TYPE RESPONSE FOR REPORTED LATE` 타입([[abaptype_response_for]])이라 `%own` 을 쓸 수 있습니다. 예제는 child entity 를 가리킬 때 `%own` 을 쓰는데, 꼭 써야 하는 것은 아닙니다. `%path`, `%element`, `%state_area` 도 채웁니다. 새 메시지를 넣기 전에 상태 영역을 먼저 무효화합니다.

두 메서드 모두, 쓰는 법을 보여 주려고 entity(엔터티)에 묶이지 않은 메시지 하나를 `%other` 에 넣습니다.

## 예제

같은 내용을 공통 예제 모델로 옮겼습니다. 예약의 탑승일(`FlightDate`)이 여행 기간 안에 있는지 살피는 validation 입니다. child entity 의 BDEF 부분은 이렇습니다.

```bdl
// child entity Booking 의 behavior definition 안에 적는다
validation validateDate on save { create; field FlightDate; }
```

validation 메서드입니다.

```abap
METHOD validatedate.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY booking
      FIELDS ( flightdate ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_booking).

  " 부모 여행의 기간을 읽는다
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY booking BY \_travel
      FIELDS ( begindate enddate ) WITH CORRESPONDING #( lt_booking )
    RESULT DATA(lt_travel).

  LOOP AT lt_booking INTO DATA(ls_booking).
    DATA(ls_travel) = VALUE #( lt_travel[ KEY entity COMPONENTS
                                 travelid = ls_booking-travelid ] OPTIONAL ).

    " 지난번에 남긴 상태 메시지를 무효화한다
    APPEND VALUE #( %tky        = ls_booking-%tky
                    %state_area = 'VALIDATE_DATE' )
      TO reported-%own-booking.

    IF ls_booking-flightdate NOT BETWEEN ls_travel-begindate
                                     AND ls_travel-enddate.
      APPEND VALUE #( %tky = ls_booking-%tky ) TO failed-booking.

      APPEND VALUE #(
        %tky        = ls_booking-%tky
        %state_area = 'VALIDATE_DATE'
        %path       = VALUE #( travel-travelid = ls_booking-travelid )
        %msg        = new_message_with_text(
                        severity = if_abap_behv_message=>severity-error
                        text     = '탑승일이 여행 기간을 벗어났습니다.' )
        %element-flightdate = if_abap_behv=>mk-on )
        TO reported-%own-booking.
    ENDIF.
  ENDLOOP.

  " entity 에 묶이지 않은 메시지
  reported-%other = VALUE #(
    ( new_message_with_text(
        severity = if_abap_behv_message=>severity-information
        text     = '탑승일 validation 을 마쳤습니다.' ) ) ).
ENDMETHOD.
```

RAP BO consumer(사용자)는 interaction phase(상호작용 단계)의 메시지를 `REPORTED EARLY` 로, save sequence(저장 순서)의 메시지를 `REPORTED LATE` 로 받습니다.

```abap
DATA: ls_reported_early TYPE RESPONSE FOR REPORTED EARLY zr_travel,
      ls_reported_late  TYPE RESPONSE FOR REPORTED LATE zr_travel.

MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE BY \_booking FIELDS ( bookingid flightdate )
      WITH VALUE #(
        ( %key-travelid = '00000001'
          %target = VALUE #( ( %cid       = 'B1'
                               bookingid  = '0001'
                               flightdate = '20270115' ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED ls_reported_early.

" validation 은 저장할 때 돈다. 그 메시지는 REPORTED LATE 로 온다
COMMIT ENTITIES RESPONSE OF zr_travel
  REPORTED ls_reported_late.
```

### 실행 결과

SAP 예제 클래스는 EML 요청을 다섯 번 보내고, 그때마다 응답과 데이터베이스 테이블 내용을 출력합니다.

1. **루트 인스턴스 생성** : root entity 인스턴스를 여러 개 만들고 `COMMIT ENTITIES`([[abapcommit_entities]])로 저장합니다. `REPORTED EARLY` 응답에 `%global` 표시가 켜진 메시지와 `%other` 의 내용이 보입니다.
2. **첫 번째 association 생성** : 자식 인스턴스를 여러 개 만듭니다. 모두 validation 을 통과하도록 값을 주었으므로 전부 저장됩니다. validation 이 성공했으니 `REPORTED LATE` 의 entity 테이블은 비어 있습니다. validation 메서드가 `%other` 에 넣은 메시지만 보입니다.
3. **두 번째 association 생성** : 자식 인스턴스 두 개를 일부러 validation 에 걸리게 만듭니다. `COMMIT ENTITIES` 를 해도 저장되지 않아 데이터베이스 테이블은 그대로입니다. `REPORTED LATE` 에 줄이 생기고 `%path` 와 `%element` 의 내용을 볼 수 있습니다. 다만 여기서는 `%state_area` 가 비어 있습니다. `%other` 의 메시지도 함께 나옵니다.
4. **association 읽기** : 방금 실패한 인스턴스를 association 으로 읽습니다. 이 요청은 `%state_area` 를 보여 주려는 것입니다. `REPORTED EARLY` 응답에서 `%state_area` 에 값이 들어 있습니다.
5. **세 번째 association 생성** : 먼저 `ROLLBACK ENTITIES`([[abaprollback_entities]])로 지금 RAP 트랜잭션의 변경을 모두 되돌립니다. 그런 다음 같은 키로 자식 인스턴스 두 개를 다시 만드는데, 이번에는 validation 을 통과하는 값입니다. 저장이 되고, `REPORTED EARLY` 와 `REPORTED LATE` 어느 쪽에도 child entity 줄은 없습니다. 두 응답의 `%other` 메시지만 나옵니다.

## 알아두기

- 상태 메시지의 `%state_area` 는 저장 직후의 `REPORTED LATE` 에서는 보이지 않습니다. 실패한 인스턴스를 `READ` 문으로 읽어야 볼 수 있습니다. 3번과 4번 단계가 이 차이를 보여 줍니다.
- validation 메서드 안에서 `reported-%own-booking` 대신 `reported-booking` 이라고 써도 됩니다.
- validation 과 권한 메서드에서 `%other` 를 채우는 것은 쓰는 법을 보여 주려는 것일 뿐입니다.
- 메시지 처리 전반은 SAP 의 RAP 개발 안내서 "Messages" 단원에 자세히 나와 있습니다.

## 관련 항목

- [[abapderived_types_state_area]]
- [[abapderived_types_path]]
- [[abapderived_types_other]]
- [[abapderived_types_own]]
- [[abaptype_response_for]]
- [[abenbdl_validations]]
- [[abapcommit_entities]]
- [[abenrap_messages_abexa]]
