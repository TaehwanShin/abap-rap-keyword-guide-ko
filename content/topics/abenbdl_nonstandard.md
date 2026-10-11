---
title: non-standard operation (action 과 function)
summary: standard operation 으로 나타낼 수 없는 업무 처리를 개발자가 직접 구현하는 작업으로, 데이터를 바꾸는 action 과 정보만 돌려주는 function 이 있습니다.
keywords: non-standard operations, 비표준 작업, action, function, 액션, 함수, 사용자 구현 작업, FOR MODIFY, FOR READ
---

## 설명

non-standard operation(비표준 작업)은 트랜잭션 동작을 제공하는 RAP BO 작업 가운데 **개발자가 직접 구현하는** 작업입니다. 생성·수정·삭제 같은 [[abenbdl_standard_operations|standard operation]] 은 틀이 정해져 있지만, non-standard operation 은 이름도 처리 내용도 업무에 맞춰 정합니다.

non-standard operation 은 두 가지입니다. 가장 큰 차이는 데이터를 바꾸느냐입니다.

- [[abenbdl_action|action]] : BO 인스턴스의 데이터를 **바꾸는** 사용자 구현 작업입니다. "여행 승인", "예약 취소" 같은 처리가 여기에 듭니다.
- [[abenbdl_function|function]] : side effects 없이 **정보만 돌려주는** 사용자 구현 작업입니다. 계산이나 조회에 씁니다.

## 예제

`acceptTravel` 은 상태를 바꾸므로 action 으로, `getDetails` 는 읽기만 하므로 function 으로 선언합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  field ( readonly ) TravelID;

  // action: 데이터를 바꾼다
  action acceptTravel result [1] $self;

  // function: 정보만 돌려준다
  function getDetails result [1] $self;
}
```

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_operations]]
