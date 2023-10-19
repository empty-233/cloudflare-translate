$(document).ready(function () {
  const toast_beyond = new bootstrap.Toast($(".beyond"));
  $(".source-language-btn .dropdown-menu button").on("click", function () {
    $(".source-language-btn .dropdown-menu button").removeClass("active");
    $(this).addClass("active");
    $(".source-language-btn .dropdown-text").text($(this).text());
  });

  const source_language_text = $("#source-language-text");

  const loaderDisplay = (status) => {
    if (status) {
      $(".spinner").show();
    } else {
      $(".spinner").hide();
    }
  };

  let translate_type = $(".btn-group.translate-type input:checked").attr("id");
  $(".btn-group.translate-type input").on("click", () => {
    translate_type = $(".btn-group.translate-type input:checked").attr("id");
    const limit_text = $(".limit-text");
    const textLength = countTokens(source_language_text.val().trim());
    if (translate_type == "whole-paragraph") {
      limit_text.text(`${textLength}/256 Token`);
      source_language_text.attr("maxlength", 256);
    } else if (translate_type == "segmentation") {
      limit_text.text("");
      source_language_text.removeAttr("maxlength");
    }
  });

  const ajax = async () => {
    const text = source_language_text.val().trim();
    if (!text) return;
    loaderDisplay(true);
    let response;
    if (translate_type == "whole-paragraph") {
      response = (await api(text)).response.translated_text;
    } else if (translate_type == "segmentation") {
      let textArr = source_language_text
        .val()
        .trim()
        .split(/\n/)
        .filter((item) => item !== "");
      let rows = [];
      for (let index = 0; index < textArr.length; index++) {
        const text = textArr[index];
        if (countTokens(text) >= 256) {
          rows.push(index + 1);
        }
        if (index === 0) {
          response = (await api(text.trim())).response.translated_text;
        } else {
          response += "\n" + (await api(text.trim())).response.translated_text;
        }
      }
      $(".beyond .toast-body").text(
        `第 ${rows.splice(",")} 段超过 256 Token，可能会被截断`
      );
      toast_beyond.show();
    }
    loaderDisplay(false);
    const target_language_text = $("#target-language-text");
    target_language_text.val(response);
    target_language_text.css("height", "300px");
    target_language_text.css(
      "height",
      target_language_text.prop("scrollHeight") + "px"
    );
  };

  const api = (text) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "https://translate.api.kongwu.top",
        method: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          text,
          // source_lang: $(".source-language-btn>.btn-info")
          source_lang: $(".source-language-btn .dropdown-menu button.active")
            .attr("id")
            .replace("source-", ""),
          // target_lang: $(".target-language-btn>.btn-info")
          target_lang: $(".target-language-btn .dropdown-menu button.active")
            .attr("id")
            .replace("target-", ""),
        }),
        success: function (response) {
          console.log(response);
          resolve(response);
        },
        error: function (xhr, status, error) {
          $("#target-language-text").val("出现错误");
          console.log(error);
          loaderDisplay(false);
          reject(error);
        },
      });
    });
  };

  $(".target-language-btn .dropdown-menu button").on("click", function () {
    $(".target-language-btn .dropdown-menu button").removeClass("active");
    $(this).addClass("active");
    $(".target-language-btn .dropdown-text").text($(this).text());
    ajax();
  });

  source_language_text.on("input", () => {
    const limit_text = $(".limit-text");
    const textLength = countTokens(source_language_text.val().trim());
    const maxLength = parseInt(source_language_text.attr("maxlength"));
    if (translate_type == "whole-paragraph") {
      limit_text.text(`${textLength}/${maxLength} Token`);
      if (textLength >= maxLength) {
        limit_text.css("color", "red");
      } else {
        limit_text.css("color", "black");
      }
    } else {
      limit_text.text("");
      source_language_text.removeAttr("maxlength");
    }
  });

  source_language_text.keydown((event) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      ajax();
    }
  });

  $(".md-translate-btn").click(() => {
    ajax();
  });
});

const autoExpand = (element) => {
  element.style.height = (element.scrollHeight > element.clientHeight) ? (element.scrollHeight)+"px" : "300px";
};

const countTokens = (text) => {
  const tokens = text.split(/(?=[\p{L}\p{N}-])/gu);
  if (tokens) {
    return tokens.length;
  } else {
    return 0;
  }
};
