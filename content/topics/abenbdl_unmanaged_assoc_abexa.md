---
title: 예제 - unmanaged association 구현
summary: ON 조건에 거르는 조건이 붙은 association 을 unmanaged 로 선언하고, read-by-association 과 생성을 behavior pool 에 직접 구현하는 예제입니다.
keywords: unmanaged association, 비관리형 연관 관계, 예제, create-by-association, read-by-association, cba, rba, CREATE BY, READ BY, LINK, 연관 관계로 생성, 연관 관계로 읽기, 필터 조건
---

## 설명

같은 BO 안의 composition 에서 read-by-association 과 create-by-association 을 **직접 구현**하는 예제입니다.

CDS 데이터 모델에 ON 조건으로 인스턴스를 거르는 association 이 있습니다. managed RAP BO provider(제공자)는 association 으로 읽거나 만들 때 이 거르는 조건을 따지지 않습니다. 그래서 그 association 을 `unmanaged` 로 선언하고 조건을 지키는 구현을 직접 씁니다.

원문은 부모(소스) entity(엔터티)와 자식(대상) entity 로 설명합니다. 여기서는 여행과 예약으로 바꿔 적습니다.

- 여행에서 예약으로 가는 composition `_Booking` 이 있습니다.
- 같은 부모·자식 관계를 보통 association `_ConfirmedBooking` 으로 한 번 더 넣습니다. behavior definition(동작 정의)에서 unmanaged association 의 바탕이 됩니다. ON 조건으로 `BookingStatus` 가 `'C'` 인 예약만 고릅니다.

## 예제

### 데이터 모델과 behavior definition

여행 뷰 entity 에 association 을 둘 둡니다.

```cds
composition [0..*] of ZR_Booking as _Booking
association [0..*] to ZR_Booking as _ConfirmedBooking
  on  $projection.TravelID            = _ConfirmedBooking.TravelID
  and _ConfirmedBooking.BookingStatus = 'C'
```

behavior definition 에서는 `_ConfirmedBooking` 을 `unmanaged` 로 선언하고 생성과 draft 처리를 엽니다.

```bdl
unmanaged association _ConfirmedBooking { create; with draft; }
```

### behavior pool: create-by-association

넘어온 예약(`entities_cba`)을 composition `_Booking` 용 타입으로 옮겨 담고, 조건에 맞지 않는 예약을 빼낸 다음, 실제 생성은 managed composition 에 맡깁니다.

```abap
METHOD cba_confirmedbooking.
  DATA lt_cba TYPE TABLE FOR CREATE zr_travel\_booking.
  lt_cba = CORRESPONDING #( DEEP entities_cba ).

  DATA lt_failed LIKE failed-booking.
  LOOP AT lt_cba ASSIGNING FIELD-SYMBOL(<ls_cba>).
    CLEAR <ls_cba>-%cid_ref.
    LOOP AT <ls_cba>-%target ASSIGNING FIELD-SYMBOL(<ls_target>).
      IF <ls_target>-%control-bookingstatus = if_abap_behv=>mk-off.
        " 상태를 주지 않았으면 %control 을 on 으로 하고 'C' 로 채운다
        <ls_target>-%control-bookingstatus = if_abap_behv=>mk-on.
        <ls_target>-bookingstatus          = 'C'.
      ELSEIF <ls_target>-bookingstatus <> 'C'.
        " 상태를 직접 줬는데 'C' 가 아니면 실패로 적고 목록에서 뺀다
        APPEND VALUE #( %cid        = <ls_target>-%cid
                        %is_draft   = <ls_target>-%is_draft
                        %fail-cause = if_abap_behv=>cause-unspecific ) TO lt_failed.
        DELETE <ls_cba>-%target.
      ENDIF.
    ENDLOOP.
  ENDLOOP.

  " 실제 생성은 managed composition _Booking 에 맡긴다
  MODIFY ENTITY IN LOCAL MODE zr_travel
    CREATE BY \_booking FROM lt_cba
    MAPPED mapped FAILED failed REPORTED reported.
  APPEND LINES OF lt_failed TO failed-booking.
ENDMETHOD.
```

### behavior pool: read-by-association

composition `_Booking` 으로 자식을 모두 읽은 뒤, 조건에 맞지 않는 줄을 결과와 연결 정보에서 지웁니다.

```abap
METHOD rba_confirmedbooking.
  DATA lt_rba TYPE TABLE FOR READ IMPORT zr_travel\_booking.
  lt_rba = CORRESPONDING #( keys_rba ).
  LOOP AT lt_rba ASSIGNING FIELD-SYMBOL(<ls_rba>).
    " 거르는 데 쓸 BookingStatus 를 반드시 읽게 한다
    <ls_rba>-%control-bookingstatus = if_abap_behv=>mk-on.
  ENDLOOP.

  READ ENTITY IN LOCAL MODE zr_travel
    BY \_booking FROM lt_rba
    RESULT result LINK DATA(lt_link) FAILED failed.

  LOOP AT result ASSIGNING FIELD-SYMBOL(<ls_result>).
    IF <ls_result>-bookingstatus <> 'C'.
      " 'C' 가 아닌 예약은 연결 정보와 결과에서 뺀다
      DELETE lt_link WHERE target-%tky = <ls_result>-%tky.
      DELETE result.
    ENDIF.
  ENDLOOP.
  association_links = CORRESPONDING #( lt_link ).
ENDMETHOD.
```

### 사용하는 쪽

```abap
" unmanaged association 으로 예약 세 건을 만들어 본다
MODIFY ENTITY zr_travel
  CREATE BY \_confirmedbooking
  FROM VALUE #( ( travelid = '00000001' %target = VALUE #(
    ( %cid = 'cid1' bookingstatus = 'C' %control-bookingstatus = if_abap_behv=>mk-on )
    ( %cid = 'cid2' bookingstatus = 'N' %control-bookingstatus = if_abap_behv=>mk-on )
    ( %cid = 'cid3' bookingstatus = 'C' ) ) ) ).

" composition 으로는 조건 없이 한 건을 만든다
MODIFY ENTITY zr_travel
  CREATE BY \_booking
  FROM VALUE #( ( travelid = '00000001' %target = VALUE #(
    ( %cid = 'cid4' bookingstatus = 'X' %control-bookingstatus = if_abap_behv=>mk-on ) ) ) ).
COMMIT ENTITIES.

" unmanaged association 으로 다시 읽는다
READ ENTITY zr_travel
  BY \_confirmedbooking
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT FINAL(lt_confirmed).
```

## 알아두기

실행하면 다음과 같이 됩니다.

- `cid1` : 조건(`'C'`)에 맞으므로 만들어집니다.
- `cid2` : 조건에 맞지 않으므로 거절됩니다.
- `cid3` : `%control` 을 on 으로 하지 않았으므로, 핸들러가 값을 `'C'` 로 채워서 만듭니다.
- `cid4` : composition `_Booking` 으로 만들었으므로 거르는 조건이 적용되지 않습니다. `'X'` 그대로 데이터베이스에 들어갑니다. 다음 읽기에서 걸러지는 모습을 보여 주려고 넣은 단계입니다.
- 마지막 읽기는 `_ConfirmedBooking` 을 거칩니다. 이 association 이 BDEF 에서 `unmanaged` 이므로 behavior pool(동작 풀)의 읽기 메서드가 불리고, 상태가 `'C'` 인 예약만 돌아옵니다.

눈여겨볼 점은 두 메서드 모두 일을 처음부터 다 하지 않는다는 것입니다. 조건만 직접 챙기고, 실제 읽기와 생성은 `IN LOCAL MODE` 로 managed composition `_Booking` 에 넘깁니다.

## 관련 항목

- [[abenbdl_assoc_impl_type]]
- [[abenbdl_association]]
- [[abenbdl_assoc_stand_ops]]
- [[abaphandler_meth_modify]]
